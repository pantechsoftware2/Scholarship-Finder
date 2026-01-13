// app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("id, scholarships")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("report fetch error:", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    scholarships: data.scholarships
  });
}
