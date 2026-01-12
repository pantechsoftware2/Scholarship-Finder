// app/api/notifications/send/route.ts
import { sendWelcomeEmail } from "@/app/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔔 API received:", body);

    const { type, email, name, reportLink } = body;

    if (!email || !type) {
      console.error("❌ Missing fields");
      return NextResponse.json(
        { success: false, error: "Missing email or type" },
        { status: 400 }
      );
    }

    console.log("📧 Sending email to:", email);

    if (type === "welcome") {
      const success = await sendWelcomeEmail(email, name, reportLink);
      console.log("📧 sendWelcomeEmail result:", success);
      return NextResponse.json({ success });
    }

    return NextResponse.json(
      { success: false, error: "Unknown type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("💥 API Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
