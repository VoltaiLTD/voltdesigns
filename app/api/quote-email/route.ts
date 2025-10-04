// app/api/quote-email/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      projectName = "",
      clientName = "",
      email = "",
      message = "",
      selections = [],
      estimate = 0,
    } = body ?? {};

    // Required envs for Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM = process.env.RESEND_FROM || "no-reply@yourdomain.com";
    const QUOTE_TO = process.env.QUOTE_TO || "sales@yourdomain.com";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    const html = `
      <h2>New Quote Request</h2>
      <p><b>Project:</b> ${escapeHtml(projectName)}</p>
      <p><b>Client:</b> ${escapeHtml(clientName)}</p>
      <p><b>Email:</b> ${escapeHtml(email)}</p>
      <p><b>Estimate:</b> ₦${Number(estimate).toLocaleString()}</p>
      <p><b>Selections:</b> ${
        Array.isArray(selections) ? selections.map(escapeHtml).join(", ") : escapeHtml(String(selections))
      }</p>
      <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    `;

    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [QUOTE_TO],
      subject: `Quote request: ${projectName || "Untitled"}`,
      html,
      replyTo: email || undefined,
    });

    if (error) {
      // Resend returns a structured error; surface a friendly message
      return NextResponse.json(
        { error: typeof error === "string" ? error : (error as any)?.message || "Email send failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, via: "resend" });
  } catch (err: any) {
    console.error("quote-email error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

/** very small HTML escaper to avoid broken markup */
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
