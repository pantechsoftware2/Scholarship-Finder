// app/api/start-hunt/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // TODO: replace this with REAL Gemini AI call later
    const fakeScholarships = [
      {
        name: "Commonwealth Master’s Scholarship",
        country: "UK",
        amount: "₹65,00,000",
        deadline: "2026-01-25",
        benefits:
          "Fully funded tuition, living stipend, flights and other allowances.",
      },
      {
        name: "Erasmus Mundus Joint Master",
        country: "EU (Multiple)",
        amount: "₹60,00,000",
        deadline: "2026-03-01",
        benefits:
          "Study in 2–3 European countries with full tuition and monthly stipend.",
      },
      {
        name: "Chevening Scholarship",
        country: "UK",
        amount: "₹55,00,000",
        deadline: "2025-11-05",
        benefits:
          "One‑year master’s with full tuition, stipend, and travel allowance.",
      },
      {
        name: "DAAD EPOS Scholarship",
        country: "Germany",
        amount: "₹40,00,000",
        deadline: "2025-10-15",
        benefits:
          "Master’s in Germany with stipend, health insurance, and travel.",
      },
      {
        name: "Fulbright Foreign Student Program",
        country: "USA",
        amount: "₹70,00,000",
        deadline: "2025-12-01",
        benefits:
          "Full tuition, living stipend, and health insurance in the US.",
      },
      {
        name: "Australia Awards Scholarship",
        country: "Australia",
        amount: "₹50,00,000",
        deadline: "2025-09-30",
        benefits:
          "Full funding for postgraduate study with settlement allowance.",
      },
      {
        name: "Vanier Canada Graduate Scholarship",
        country: "Canada",
        amount: "₹75,00,000",
        deadline: "2025-10-31",
        benefits:
          "High‑value PhD scholarship with generous annual stipend.",
      },
      {
        name: "GREAT Scholarship",
        country: "UK",
        amount: "₹20,00,000",
        deadline: "2025-04-30",
        benefits:
          "Tuition support for one‑year master’s at partner universities.",
      },
    ];

    const { data, error } = await supabase
      .from("reports")
      .insert({
        scholarships: fakeScholarships,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Report insert error:", error);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reportId: data.id });
  } catch (err) {
    console.error("start-hunt error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
