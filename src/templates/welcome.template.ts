import { escapeHtml } from "../utils/sanitize";

export const welcomeEmailTemplate = (name: string) => {
  const safeName = escapeHtml(name);
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">

            <tr>
              <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">${process.env.EMAIL_FROM_NAME || "N.Honest Supermarket"}</p>
                <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700; line-height: 1.3;">Welcome aboard, ${safeName}!</h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 32px; color: #374151; font-size: 15px; line-height: 1.6;">
                <p style="margin: 0 0 16px;">Hi ${safeName},</p>
                <p style="margin: 0 0 20px;">Thank you for registering with us. We're excited to have you on board, and your account is ready to use.</p>

                <p style="margin: 0 0 10px; font-weight: 600; color: #111827;">What's next?</p>
                <ul style="margin: 0 0 24px; padding-left: 20px; color: #4b5563;">
                  <li style="margin-bottom: 6px;">Log in with your email and password</li>
                  <li style="margin-bottom: 6px;">Keep your password safe and never share it</li>
                  <li>Forgot it? Request a reset code anytime</li>
                </ul>

                <p style="margin: 0; color: #374151;">Cheers,<br /><strong style="color: #111827;">The ${process.env.EMAIL_FROM_NAME || "N.Honest Supermarket"} Team</strong></p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; color: #6b7280; font-size: 12px; line-height: 1.5;">
                <p style="margin: 0 0 4px;">If you didn't create this account, you can safely ignore this email.</p>
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${process.env.EMAIL_FROM_NAME || "N.Honest Supermarket"}. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;
};
