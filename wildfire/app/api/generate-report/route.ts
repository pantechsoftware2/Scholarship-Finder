import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------- REAL GEMINI CALL ----------

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function callLLMForScholarships(
  user: {
    targetCountries: string[];
    major: string;
    gpa: number;
    tags: string[];
  },
  now: Date
): Promise<{
  total_value_found: string;
  scholarships: {
    name: string;
    country: string;
    amount: string;
    deadline: string;
    match_score: number;
    why_it_fits: string;
    strategy_tip: string;
  }[];
}> {
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

You MUST return at least 8 scholarships (if such relevant, active scholarships exist). If you find more, return up to 15 of the best matches.

CRITICAL RULES:
1. NO EXPIRED DEADLINES. If a deadline is before Current Date, discard it immediately.
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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
   // tools: [{ googleSearch: {} }],
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

  const scholarships = Array.isArray(parsed.scholarships)
    ? parsed.scholarships
    : [];

  const total_value_found =
    typeof parsed.total_value_found === "string"
      ? parsed.total_value_found
      : "";

  return {
    total_value_found,
    scholarships,
  };
}
