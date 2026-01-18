// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/app/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    console.log("🔔 /api/notifications/send received body:", body);

    if (!body) {
      console.error("❌ Invalid JSON body");
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { type, email, name, reportLink } = body;

    if (!email) {
      console.error("❌ Missing field: email");
      return NextResponse.json(
        { success: false, error: "Missing email" },
        { status: 400 }
      );
    }

    if (!type) {
      console.error("❌ Missing field: type");
      return NextResponse.json(
        { success: false, error: "Missing type" },
        { status: 400 }
      );
    }

    if (!name) {
      console.error("❌ Missing field: name");
      return NextResponse.json(
        { success: false, error: "Missing name" },
        { status: 400 }
      );
    }

    if (!reportLink) {
      console.error("❌ Missing field: reportLink");
      return NextResponse.json(
        { success: false, error: "Missing reportLink" },
        { status: 400 }
      );
    }

    console.log("📧 Ready to send email:", { type, email, name, reportLink });

    if (type === "welcome") {
      const success = await sendWelcomeEmail(email, name, reportLink);
      console.log("📧 sendWelcomeEmail returned:", success);

      if (!success) {
        return NextResponse.json(
          { success: false, error: "Failed to send email" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    console.error("❌ Unknown email type:", type);
    return NextResponse.json(
      { success: false, error: "Unknown email type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("💥 API Error in /api/notifications/send:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
