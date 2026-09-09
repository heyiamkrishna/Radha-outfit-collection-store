import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "[EMAIL WARNING]: RESEND_API_KEY is not defined in your environment variables. Emails will fail to send."
  );
}

const resend = new Resend(resendApiKey || "missing_key");

/**
 * Sends a transactional email using Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body content
 * @param {string} [options.from] - Sender email address
 */
export async function sendEmail({ to, subject, html, from }) {
  if (!resendApiKey) {
    console.error("[EMAIL ABORTED]: Cannot send email without RESEND_API_KEY.");
    return { success: false, error: "Missing RESEND_API_KEY" };
  }

  // Fallback sender: onboarding@resend.dev is Resend's free sandbox sender
  const sender =
    from || process.env.EMAIL_FROM || "Radha Outfit Collection <onboarding@resend.dev>";

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("[RESEND DISPATCH ERROR]:", {
        message: error.message,
        name: error.name,
        recipient: to,
        sender,
      });

      // Special helper log for the common Resend sandbox restriction
      if (error.message?.includes("testing emails to your own email address")) {
        console.warn(
          "[RESEND SANDBOX RESTRICTION]: With 'onboarding@resend.dev', you can only send to the email address registered on your Resend account. To send to arbitrary client emails, verify your custom domain in the Resend dashboard."
        );
      }

      return { success: false, error };
    }

    console.log(`[EMAIL SUCCESS]: Dispatched to ${to} (Message ID: ${data?.id})`);
    return { success: true, data };
  } catch (err) {
    console.error("[EMAIL SYSTEM EXCEPTION]:", err);
    return { success: false, error: err.message };
  }
}