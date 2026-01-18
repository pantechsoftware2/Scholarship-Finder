// app/api/unlock-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, name, email, whatsapp } = body as {
      reportId: string;
      name: string;
      email: string;
      whatsapp: string;
    };

    if (!reportId || !name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
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

    // Send user to the matches list (/hunt) instead of a single scholarship page
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      "http://localhost:3000";

    const cleanBase = baseUrl.replace(/\/$/, "");
    const magicLink = `${cleanBase}/hunt?id=${reportId}`;

    return NextResponse.json({ leadId: data.id, magicLink });
  } catch (err: any) {
    console.error("unlock-report route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
