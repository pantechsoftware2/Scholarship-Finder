// app/api/unlock-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { reportId, name, email, whatsapp } = await req.json();

    if (!reportId || !name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Missing reportId, name, email or whatsapp" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("reports")
      .update({ name, email, whatsapp })
      .eq("id", reportId)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("unlock-report error:", e.message);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
