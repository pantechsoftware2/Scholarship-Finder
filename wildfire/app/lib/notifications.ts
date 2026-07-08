// app/lib/notifications.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is missing at module load");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  name: string,
  reportLink: string
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing in sendWelcomeEmail");
      return false;
    }

    if (!email) {
      console.error("❌ sendWelcomeEmail called without email");
      return false;
    }

    const fromAddress =
      process.env.EMAIL_FROM || "Funding Engine <noreply@fundmystudyabroad.com>";

    console.log("📧 Preparing email via Resend:", {
      to: email,
      from: fromAddress,
      reportLink,
    });

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "🎓 Your Funding Roadmap is Ready!",
      html: `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#0b0f19;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:24px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:#000000;border-radius:16px;padding:28px;color:#ffffff;">
            <tr>
              <td style="text-align:center;">
                <h2 style="color:#22d3ee;margin:0;">Hi ${name}! 👋</h2>
                <p style="color:#cbd5f5;font-size:14px;margin-top:8px;">
                  Your personalized <strong>Funding Roadmap</strong> is ready.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px;margin-top:16px;background:#020617;border-radius:10px;border-left:4px solid #22d3ee;">
                <p style="margin:0;color:#e5e7eb;font-size:14px;">
                  ✨ We found <strong style="color:#22d3ee;">real scholarship value matching your profile</strong>.<br/>
                  Tap below to see the full breakdown on fundmystudyabroad.com.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:26px 0;">
                <a href="${reportLink}"
                  style="
                    background:#22d3ee;
                    color:#000000;
                    text-decoration:none;
                    padding:14px 26px;
                    border-radius:999px;
                    font-weight:bold;
                    display:inline-block;
                  ">
                  🔓 View My Funding Roadmap
                </a>
              </td>
            </tr>

            <tr>
              <td style="text-align:center;color:#94a3b8;font-size:12px;">
                Share this with your parents & mentor.<br/><br/>
                Questions? Chat with mentors on WhatsApp 📱<br/>
                Sent by fundmystudyabroad.com
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    });

    console.log("📨 Resend response data:", data);
    if (error) {
      console.error("❌ Resend error:", error);
      return false;
    }

    console.log("✅ Resend email ID:", data?.id);
    return true;
  } catch (error) {
    console.error("💥 Resend exception:", error);
    return false;
  }
}
