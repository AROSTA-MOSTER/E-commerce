import { getTransporter } from "../config/mail";
import { welcomeEmailTemplate } from "../templates/welcome.template";
import { escapeHtml } from "../utils/sanitize";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
  name?: string
): Promise<void> => {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (brevoApiKey) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME || "E-Commerce Store",
          email: process.env.EMAIL_FROM || "noreply@example.com",
        },
        to: [{ email: to, name: name ?? to }],
        subject,
        htmlContent: html,
        replyTo: replyTo ? { email: replyTo } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error ${response.status}: ${errorText}`);
    }
    return;
  }

  await getTransporter().sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "E-Commerce Store"}" <${
      process.env.EMAIL_FROM || process.env.EMAIL_USER
    }>`,
    to,
    subject,
    html,
    replyTo,
  });
};

export const sendResetCodeEmail = async (to: string, code: string): Promise<void> => {
  const subject = "Password Reset Code";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;
                background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
      <p style="color: #374151;">Hello,</p>
      <p style="color: #374151;">Here is your password reset verification code:</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px;
                  text-align: center; font-size: 24px; font-weight: bold;
                  letter-spacing: 4px; color: #111827; border: 1px solid #e5e7eb;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
        This code expires in 10 minutes. If you did not request a reset, ignore this email.
      </p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const subject = `Welcome to ${process.env.EMAIL_FROM_NAME || "N.Honest Supermarket"}!`;
  const html = welcomeEmailTemplate(name);
  await sendEmail(to, subject, html, undefined, name);
};

export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  const recipient =
    process.env.CONTACT_EMAIL ||
    process.env.EMAIL_FROM ||
    "noreply@example.com";

  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p>
  `;

  await sendEmail(recipient, `Contact form: ${subject}`, html, email, name);
};
