// wildfire/app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Optional: keep normalization on the read side too, in case old data exists
function normalizeDeadline(raw: string | null | undefined): string {
  if (!raw) return "Deadline unknown";

  const lower = raw.toLowerCase();

  if (lower.includes("passed")) return "Deadline passed";
  if (lower.includes("unknown")) return "Deadline unknown";

  // Changed text here to match start-hunt
  if (lower.includes("application deadline for admission")) {
    return "Check official website for deadline";
  }

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return raw;
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

    // Normalize deadlines on the way out (defensive in case older rows are messy)
    const scholarshipsWithCleanDeadlines = Array.isArray(data.scholarships)
      ? data.scholarships.map((s: any) => ({
          ...s,
          deadline: normalizeDeadline(s.deadline),
        }))
      : [];

    const transformedData = {
      ...data,
      scholarships: scholarshipsWithCleanDeadlines,
      user_name: data.input?.name || undefined,
    };

    return NextResponse.json(transformedData);
  } catch (err: any) {
    console.error("💥 /api/report error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
