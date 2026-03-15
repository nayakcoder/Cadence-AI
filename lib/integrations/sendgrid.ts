import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  sendAt?: number; // Unix timestamp
  customArgs?: Record<string, string>;
}

export const SendGridService = {
  async sendEmail(input: SendEmailInput) {
    const msg: sgMail.MailDataRequired = {
      to: input.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "outreach@cadenceai.com",
        name: "Cadence AI",
      },
      subject: input.subject,
      html: input.html,
      text: input.text || "",
      customArgs: input.customArgs,
    };
    if (input.sendAt) {
      (msg as any).sendAt = input.sendAt;
    }
    return sgMail.send(msg);
  },

  async sendNotificationEmail(to: string, subject: string, message: string) {
    return this.sendEmail({
      to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Cadence AI Notification</h2>
        <p>${message}</p>
        <hr />
        <p style="color: #888; font-size: 12px;">This is an automated notification from Cadence AI.</p>
      </div>`,
    });
  },
};