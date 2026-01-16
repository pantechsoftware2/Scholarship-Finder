// app/api/unlock-report/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId, name, email, whatsapp } = body;

    if (!reportId || !name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        report_id: reportId,
        name,
        email,
        whatsapp,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Leads insert error:", error);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // You can customize the magic-link path
    const magicLink = `/report/${reportId}`;

    return NextResponse.json({ leadId: data.id, magicLink });
  } catch (err: any) {
    console.error("unlock-report route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
