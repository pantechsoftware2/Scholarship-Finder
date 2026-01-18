// app/api/generate-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai";

type GeneratePayload = {
  targetCountries: string[];
  major: string;
  gpa: number;
  tags: string[];
};

type ScholarshipLLM = {
  name: string;
  country: string;
  amount: string;
  deadline: string; // YYYY-MM-DD
  match_score: number;
  why_it_fits: string;
  strategy_tip: string;
};

type LLMResponse = {
  total_value_found: string; // e.g. "₹45 Lakhs"
  scholarships: ScholarshipLLM[];
};

function isFutureOrToday(deadline: string, now: Date) {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date(now.toISOString().slice(0, 10));
  return d >= today;
}

// ---------- REAL GEMINI CALL ----------

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function callLLMForScholarships(
  user: GeneratePayload,
  now: Date
): Promise<LLMResponse> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const currentDate = now.toISOString().slice(0, 10);
  const targetCountriesJson = JSON.stringify(user.targetCountries);
  const userProfileJson = JSON.stringify({
    major: user.major,
    gpa: user.gpa,
    tags: user.tags,
  });

  const systemPrompt = `
You are an expert Study Abroad Counselor for Indian students.
Current Date: ${currentDate}
User Profile: ${userProfileJson}
Target Countries: ${targetCountriesJson}

TASK:
Search for currently ACTIVE scholarships for ANY of the Target Countries for the next intake year.

CRITICAL RULES:
1. NO EXPIRED DEADLINES. If a deadline is before Current Date, discard it immediately.
2. FILTER FOR INDIAN CITIZENS. Discard any scholarship that requires citizenship of the target country.
3. MULTI-REGION LOGIC: If multiple countries are selected, find the best options for EACH country.
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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} }],
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ],
  });

  const rawText = result.response.text().trim();

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  }

  const scholarships: ScholarshipLLM[] = Array.isArray(parsed.scholarships)
    ? parsed.scholarships
    : [];

  const total_value_found: string =
    typeof parsed.total_value_found === "string"
      ? parsed.total_value_found
      : "";

  return {
    total_value_found,
    scholarships,
  };
}

// ---------- ROUTE HANDLER ----------

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratePayload;

    if (!Array.isArray(body.targetCountries) || body.targetCountries.length === 0) {
      return NextResponse.json(
        { error: "targetCountries is required" },
        { status: 400 }
      );
    }
    if (!body.major || !body.major.trim()) {
      return NextResponse.json(
        { error: "major is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const llmData = await callLLMForScholarships(body, now);

    const filteredScholarships = (llmData.scholarships || []).filter((s) =>
      isFutureOrToday(s.deadline, now)
    );

    if (filteredScholarships.length === 0) {
      return NextResponse.json(
        { error: "No active scholarships found. Try changing your filters." },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        input: body,
        total_value_found: llmData.total_value_found,
        scholarships: filteredScholarships,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save report" },
        { status: 500 }
      );
    }

    const reportId = data.id as string;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const cleanBase = baseUrl.replace(/\/$/, "");
    const magicLink = `${cleanBase}/hunt?id=${reportId}`;

    return NextResponse.json({ reportId, magicLink }, { status: 201 });
  } catch (err: any) {
    console.error("/api/generate-report error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
