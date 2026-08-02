import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { ContactMessageModel } from "@/lib/models/ContactMessage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("A valid email address is required"),
  phone: z.string().trim().min(1, "Phone number is required").max(50),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

const getEnv = () => {
  return {
    contactEmail: process.env.CONTACT_EMAIL,
    authEmailFrom: process.env.AUTH_EMAIL_FROM,
    authEmailHost: process.env.AUTH_EMAIL_SERVER_HOST,
    authEmailPort: Number(process.env.AUTH_EMAIL_SERVER_PORT || 587),
    authEmailUser: process.env.AUTH_EMAIL_SERVER_USER,
    authEmailPassword: process.env.AUTH_EMAIL_SERVER_PASSWORD,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message || "Invalid form submission.";
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { name, email, phone, subject, message } = parsed.data;

    // Step 1: persist the submission first. The dashboard must always see the
    // message even if email delivery below fails, so the DB write happens
    // before we ever touch SMTP.
    await connectToDatabase();

    const saved = await ContactMessageModel.create({
      name,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    // Step 2: best-effort email notification. Failures here are logged but
    // never roll back or delete the saved message.
    const {
      contactEmail,
      authEmailFrom,
      authEmailHost,
      authEmailPort,
      authEmailUser,
      authEmailPassword,
      appUrl,
    } = getEnv();

    let emailSent = false;
    let emailError: string | null = null;

    if (!contactEmail || !authEmailFrom || !authEmailHost || !authEmailUser || !authEmailPassword) {
      emailError = "Email configuration is incomplete on the server.";
      console.error(
        "[contact] Skipping email notification: CONTACT_EMAIL and AUTH_EMAIL_SERVER_* must all be set.",
      );
    } else {
      try {
        const transporter = nodemailer.createTransport({
          host: authEmailHost,
          port: authEmailPort,
          secure: authEmailPort === 465,
          auth: {
            user: authEmailUser,
            pass: authEmailPassword,
          },
        });

        const dashboardLink = appUrl ? `${appUrl.replace(/\/$/, "")}/sentinel/contact-messages` : null;

        const mailOptions = {
          from: authEmailFrom,
          to: contactEmail,
          replyTo: email,
          subject: `Contact Form: ${subject}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Subject: ${subject}`,
            "",
            "Message:",
            message,
            dashboardLink ? `\nView in Sentinel: ${dashboardLink}` : "",
          ].join("\n"),
          html: `
            <div style="font-family:system-ui, sans-serif; line-height:1.5; color:#111;">
              <h2>New contact form submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <div style="margin-top:1rem; white-space:pre-wrap;">
                <strong>Message:</strong>
                <p>${message.replace(/\n/g, "<br/>")}</p>
              </div>
              ${
                dashboardLink
                  ? `<p style="margin-top:1.5rem;"><a href="${dashboardLink}">View in Sentinel Contact Messages</a></p>`
                  : ""
              }
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (error) {
        emailError = error instanceof Error ? error.message : "Unable to send the notification email.";
        console.error("[contact] Failed to send notification email:", error);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message: emailSent
          ? "Message sent successfully."
          : "Your message was received. We'll get back to you soon.",
        id: String(saved._id),
        emailSent,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to save your message. Please try again later.";
    console.error("[contact] Failed to save contact message:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
