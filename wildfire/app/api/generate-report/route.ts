// app/api/generate-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  return d >= new Date(now.toISOString().slice(0, 10));
}

// TODO: replace with real LLM client
async function callLLMForScholarships(
  user: GeneratePayload,
  now: Date
): Promise<LLMResponse> {
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
`;

  // Dummy data for dev
  return {
    total_value_found: "₹40 Lakhs",
    scholarships: [
      {
        name: "Commonwealth Master's Scholarship",
        country: "UK",
        amount: "£15,000",
        deadline: `${now.getFullYear()}-12-15`,
        match_score: 94,
        why_it_fits:
          "Your academic record and interest in research align with this award.",
        strategy_tip:
          "Highlight any independent research and leadership activities. Focus on how your work benefits India post-graduation.",
      },
      {
        name: "ASU Global Excellence Scholarship",
        country: "USA",
        amount: "$25,000",
        deadline: `${now.getFullYear()}-11-30`,
        match_score: 89,
        why_it_fits:
          "Your GPA and STEM background make you competitive for merit-based funding.",
        strategy_tip:
          "Emphasize your projects and internships with quantifiable impact. Show long-term clarity on your career path.",
      },
    ],
  };
}

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

    // IMPORTANT: first landing = locked view
    const magicLink = `${baseUrl}/hunt?id=${reportId}`;

    return NextResponse.json({ reportId, magicLink }, { status: 201 });
  } catch (err: any) {
    console.error("/api/generate-report error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
