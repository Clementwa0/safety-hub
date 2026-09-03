import nodemailer from "nodemailer";

/**
 * Thin, shared wrapper around nodemailer so every server-side email sender
 * (contact form notifications, sales document emails, ...) configures its
 * SMTP transport the same way instead of each inlining its own
 * nodemailer.createTransport() call.
 */

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
  replyTo?: string;
}

interface MailEnv {
  from: string | undefined;
  host: string | undefined;
  port: number;
  user: string | undefined;
  password: string | undefined;
}

function getMailEnv(): MailEnv {
  return {
    from: process.env.AUTH_EMAIL_FROM,
    host: process.env.AUTH_EMAIL_SERVER_HOST,
    port: Number(process.env.AUTH_EMAIL_SERVER_PORT || 587),
    user: process.env.AUTH_EMAIL_SERVER_USER,
    password: process.env.AUTH_EMAIL_SERVER_PASSWORD,
  };
}

export function isMailConfigured(): boolean {
  const env = getMailEnv();
  return Boolean(env.from && env.host && env.user && env.password);
}

export async function sendMail(input: SendMailInput): Promise<void> {
  const env = getMailEnv();

  if (!env.from || !env.host || !env.user || !env.password) {
    throw new Error(
      "Email is not configured on the server. Set AUTH_EMAIL_SERVER_HOST/USER/PASSWORD and AUTH_EMAIL_FROM.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.host,
    port: env.port,
    secure: env.port === 465,
    auth: {
      user: env.user,
      pass: env.password,
    },
  });

  await transporter.sendMail({
    from: env.from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  });
}
