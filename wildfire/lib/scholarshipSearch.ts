// lib/scholarshipSearch.ts
import { generateWithBestModel } from "@/lib/geminiClient";

export async function fetchScholarshipsTrickleDown(params: {
  userProfile: any;
  targetCountries: string[];
}) {
  const { userProfile, targetCountries } = params;

  const systemPrompt = `
You are an expert Study Abroad Counselor for Indian students.
Current Date: ${new Date().toISOString().split("T")[0]}
User Profile: ${JSON.stringify(userProfile)}
Target Countries: ${JSON.stringify(targetCountries)}

TASK:
Search for currently ACTIVE scholarships for ANY of the [Target Countries] for the upcoming intake year.

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

  const raw = await generateWithBestModel(systemPrompt);

  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return parsed as {
    total_value_found: string;
    scholarships: any[];
  };
}
