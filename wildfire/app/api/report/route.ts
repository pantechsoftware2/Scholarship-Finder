// wildfire/app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Transform data to include user_name from input
    const transformedData = {
      ...data,
      user_name: data.input?.name || data.input?.name || undefined,
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
