// app/api/start-hunt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { fetchScholarshipsTrickleDown } from "@/lib/scholarshipSearch";

export async function POST(req: NextRequest) {
  try {
    const { userProfile, targetCountries } = await req.json();

    if (!userProfile || !targetCountries || !Array.isArray(targetCountries)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const aiResult = await fetchScholarshipsTrickleDown({
      userProfile,
      targetCountries,
    });

    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .insert({
        user_profile: userProfile,
        target_countries: targetCountries,
        total_value_found: aiResult.total_value_found,
        scholarships: aiResult.scholarships, // 👈 must exist as jsonb on reports
      })
      .select("id")
      .single();

    if (error || !report) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ reportId: report.id });
  } catch (e: any) {
    console.error("start-hunt error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
