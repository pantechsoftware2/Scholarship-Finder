// wildfire/app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Scholarship = {
  name: string;
  country: string;
  amount: string;
  deadline: string;
  match_score: number;
  why_it_fits: string;
  strategy_tip: string;
};

type ReportRow = {
  id: string;
  input: any;
  total_value_found: string;
  scholarships: Scholarship[];
  created_at: string;
};

function normalizeDeadline(raw: string | null | undefined): string {
  if (!raw) return "Deadline unknown";

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return "Deadline unknown";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reports")
      .select("id, input, total_value_found, scholarships, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("❌ Report fetch error:", error);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = data as ReportRow;

    const scholarshipsWithCleanDeadlines = Array.isArray(row.scholarships)
      ? row.scholarships.map((s) => ({
          ...s,
          deadline: normalizeDeadline(s.deadline),
        }))
      : [];

    const transformedData = {
      ...row,
      scholarships: scholarshipsWithCleanDeadlines,
      user_name: row.input?.name || undefined,
    };

    return NextResponse.json(transformedData);
  } catch (err: any) {
    console.error("💥 /api/report error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
