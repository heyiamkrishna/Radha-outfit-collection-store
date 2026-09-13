import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "[EMAIL WARNING]: RESEND_API_KEY is not defined in environment variables. Outbound emails will abort gracefully."
  );
}

// Instantiate client only when valid key exists to prevent instantiation throws
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Sends a transactional email using Resend
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body content
 * @param {string} [options.from] - Sender email address
 */
export async function sendEmail({ to, subject, html, from }) {
  if (!resend || !resendApiKey) {
    console.error("[EMAIL ABORTED]: Cannot send email without RESEND_API_KEY.");
    return { success: false, error: "Missing RESEND_API_KEY" };
  }

  const sender =
    from || process.env.EMAIL_FROM || "Radha Outfit Collection <onboarding@resend.dev>";

  try {
    const recipients = Array.isArray(to) ? to : [to];

    const { data, error } = await resend.emails.send({
      from: sender,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("[RESEND DISPATCH ERROR]:", {
        message: error.message,
        recipient: to,
        sender,
      });

      return { success: false, error: error.message || error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[EMAIL SYSTEM EXCEPTION]:", err);
    return { success: false, error: err.message };
  }
}

export default sendEmail;