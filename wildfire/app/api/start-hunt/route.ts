// app/api/start-hunt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ClientPayload = {
  targetCountries: string[];
  major: string;
  gpa: number | string;
  specialPowers?: string[] | string;
  name?: string;
  gradYear?: string;
};

type Scholarship = {
  name: string;
  country: string;
  amount: string; // e.g. "$20,000" or "£10,000"
  deadline: string; // "YYYY-MM-DD"
  match_score: number; // 0-100
  why_it_fits: string;
  strategy_tip: string;
};

type ModelResponse = {
  total_value_found: string; // e.g. "₹45 Lakhs"
  scholarships: Scholarship[];
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function normalizeDeadline(raw: string | null | undefined): string {
  if (!raw) return "Deadline unknown";

  // Expect strict YYYY-MM-DD but be defensive
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return "Deadline unknown";
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    );
  }

  let body: ClientPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or empty JSON body" },
      { status: 400 }
    );
  }

  const { targetCountries, major, gpa, specialPowers, name, gradYear } = body;

  if (!targetCountries?.length || !major || gpa === undefined || gpa === null) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: targetCountries, major, and gpa are required",
      },
      { status: 400 }
    );
  }

  const gpaString = typeof gpa === "number" ? gpa.toString() : gpa;
  const specialPowersString = Array.isArray(specialPowers)
    ? specialPowers.join(", ")
    : specialPowers || "None";

  const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const targetYear = new Date().getFullYear() + 1; // e.g. next intake year

  const systemPrompt = `
You are an expert Study Abroad Counselor for Indian students.
Current Date: ${currentDate}
User Profile: ${JSON.stringify({
    major,
    gpa: gpaString,
    specialPowers: specialPowersString,
    gradYear: gradYear || "Not specified",
  })}
Target Countries: ${JSON.stringify(targetCountries)}
Target Year: ${targetYear}

TASK:
Search for currently ACTIVE scholarships for ANY of the [Target Countries] for the [Target Year] intake.

CRITICAL RULES:
1. NO EXPIRED DEADLINES. If a deadline is before [Current Date], discard it immediately.
2. FILTER FOR INDIAN CITIZENS. Discard any scholarship that requires citizenship of the target country.
3. MULTI-REGION LOGIC: If multiple countries are selected, find the best options for EACH country. Do not limit results to just one region.
4. CONTEXTUALIZE: For the "strategy_tip" field, write specific advice connecting the user's background to the scholarship.
5. CURRENCY: Keep the "amount" field in the original currency (USD/GBP/EUR) but ensure the "total_value_found" is estimated in INR.

OUTPUT FORMAT (JSON ONLY):
{
  "total_value_found": "string (e.g. ₹45 Lakhs)",
  "scholarships": [
    {
      "name": "string",
      "country": "string (e.g. USA, UK)",
      "amount": "string (e.g. $20,000 or £10,000)",
      "deadline": "YYYY-MM-DD",
      "match_score": number (0-100),
      "why_it_fits": "string (1 sentence)",
      "strategy_tip": "string (2 sentences)"
    }
  ]
}
`.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      // could be extended with structured output config later [web:632][web:372]
    });

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    let parsed: ModelResponse;
    try {
      const cleanJson = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleanJson) as ModelResponse;
    } catch {
      console.error("Gemini returned non‑JSON:", text);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    const scholarshipsRaw = Array.isArray(parsed.scholarships)
      ? parsed.scholarships
      : [];

    const scholarships: Scholarship[] = scholarshipsRaw.map((s: any) => ({
      name: s.name,
      country: s.country,
      amount: String(s.amount),
      deadline: normalizeDeadline(s.deadline),
      match_score: Number(s.match_score ?? 0),
      why_it_fits: s.why_it_fits || s.description || "",
      strategy_tip: s.strategy_tip || "",
    }));

    const totalValueFound =
      typeof parsed.total_value_found === "string"
        ? parsed.total_value_found
        : "₹0 Lakhs";

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        input: {
          ...body,
          name: name || "Anonymous",
          gradYear: gradYear || "Not specified",
        },
        total_value_found: totalValueFound,
        scholarships,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reportId: data.id,
      total_value_found: totalValueFound,
      scholarships,
    });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Scholarship hunt failed" },
      { status: 500 }
    );
  }
}
