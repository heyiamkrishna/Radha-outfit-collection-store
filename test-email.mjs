import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("❌ RESEND_API_KEY is not defined in your .env.local file!");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testDispatch() {
  console.log("⏳ Sending test email via Resend...");

  try {
    const { data, error } = await resend.emails.send({
      from: "Radha Outfit Collection <onboarding@resend.dev>",
      to: "techembersofficial@gmail.com",
      subject: "Atelier Test Confirmation - Radha Outfit Collection",
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #f8f9fc; color: #0c0d11; border-radius: 16px;">
          <h2 style="text-transform: uppercase; letter-spacing: 2px;">Radha Outfit Collection</h2>
          <p>Your Resend API connection is verified and functioning perfectly!</p>
          <div style="background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e8ebf2;">
            <p><strong>Status:</strong> Connected & Operational</p>
            <p><strong>Environment:</strong> Local / Production</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend Error Response:", error);
    } else {
      console.log("✅ Email sent successfully!");
      console.log("📨 Message ID:", data.id);
      console.log("Check the inbox of techembersofficial@gmail.com (and Spam/Junk folder).");
    }
  } catch (err) {
    console.error("❌ System Exception:", err);
  }
}

testDispatch();