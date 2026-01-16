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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

  const {
    targetCountries,
    major,
    gpa,
    specialPowers,
    name,
    gradYear,
  } = body;

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

  const prompt = `
You are an AI scholarship hunter.

Find real, relevant scholarships based on:
- Countries: ${targetCountries.join(", ")}
- Major: ${major}
- GPA: ${gpaString}
${gradYear ? `- Graduation Year: ${gradYear}` : ""}
- Extra info: ${specialPowersString}

Return ONLY valid JSON in this format:
{
  "total_value_found": number,
  "scholarships": [
    {
      "name": string,
      "country": string,
      "amount": number,
      "deadline": string,
      "description": string
    }
  ]
}
`.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed: any;
    try {
      const cleanJson = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      console.error("Gemini returned non‑JSON:", text);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        input: {
          ...body,
          name: name || "Anonymous",
          gradYear: gradYear || "Not specified",
        },
        total_value_found: parsed.total_value_found,
        scholarships: parsed.scholarships,
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
      ...parsed,
    });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Scholarship hunt failed" },
      { status: 500 }
    );
  }
}
