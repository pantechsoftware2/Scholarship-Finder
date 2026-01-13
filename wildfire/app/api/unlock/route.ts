// app/api/unlock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { reportId, name, email, whatsapp, reportLink } = await req.json();

    if (!reportId || !name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1) create lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("user_leads")
      .insert({
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim()
      })
      .select("id")
      .single();

    if (leadErr) {
      console.error("Lead insert error:", leadErr);
      return NextResponse.json({ error: "Lead error" }, { status: 500 });
    }

    // 2) attach lead to report
    const { error: updErr } = await supabaseAdmin
      .from("reports")
      .update({ lead_id: lead.id })
      .eq("id", reportId);

    if (updErr) {
      console.error("Report update error:", updErr);
      return NextResponse.json(
        { error: "Report update error" },
        { status: 500 }
      );
    }

    // 3) send email with magic link
    const baseUrl = process.env.BASE_URL ?? "https://wildfire.vercel.app";
    const link = reportLink || `${baseUrl}/report/${reportId}`;

    await resend.emails.send({
      from: "Scholarship Wildfire <no-reply@yourdomain.com>",
      to: email,
      subject: "Your Scholarship Funding Roadmap",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px;">
          <h2>Hi ${name || "there"},</h2>
          <p>Your personalized scholarship report is ready.</p>
          <p>
            <a href="${link}" style="background:#22c55e;color:#000;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600;">
              View My Scholarship Report
            </a>
          </p>
          <p style="margin-top:16px;">Or paste this link in your browser:<br>${link}</p>
        </div>
      `
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("unlock route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
