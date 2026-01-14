// app/api/notifications/send/route.ts
import { sendWelcomeEmail } from "@/app/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔔 API received:", body);

    const { type, email, name, reportLink } = body;

    // Validate all required fields
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

    console.log("📧 Sending welcome email to:", email);

    if (type === "welcome") {
      try {
        const success = await sendWelcomeEmail(email, name, reportLink);
        console.log("📧 sendWelcomeEmail result:", success);

        if (!success) {
          console.error("❌ sendWelcomeEmail failed (returned false)");
          return NextResponse.json(
            { success: false, error: "Failed to send email" },
            { status: 500 }
          );
        }

        console.log("✅ Email sent successfully to:", email);
        return NextResponse.json({ success: true });
      } catch (emailError: any) {
        console.error("❌ sendWelcomeEmail threw error:", emailError);
        return NextResponse.json(
          { success: false, error: `Email send error: ${emailError.message}` },
          { status: 500 }
        );
      }
    }

    console.error("❌ Unknown email type:", type);
    return NextResponse.json(
      { success: false, error: "Unknown email type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("💥 API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
