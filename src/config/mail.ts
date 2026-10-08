import nodemailer, { SendMailOptions, Transporter } from "nodemailer";

export const getTransporter = (): Transporter => {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass =
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.BREVO_API_KEY;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
};

export const mailFrom =
  process.env.EMAIL_FROM ||
  process.env.SMTP_USER ||
  process.env.EMAIL_USER ||
  "noreply@example.com";

export const sendMail = (options: SendMailOptions) =>
  getTransporter().sendMail(options);
