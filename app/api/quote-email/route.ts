// app/api/request-quote/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import path from "node:path";
import { promises as fs } from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuotePayload = {
  projectName: string;
  clientName: string;
  email: string;
  billingMode: "sqm" | "board";
  sqm?: number;
  boards?: number;
  fulfillment: "installation" | "delivery";
  selectedSlugs: string[];
  selectedPaths: string[];
  estimate: number;
};

// ✅ Lazy init so missing env does NOT crash at build time
let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      // We'll throw during request handling (not at import time)
      throw new Error("Missing RESEND_API_KEY");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

// For emails (HTML supports ₦ fine)
function naira(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

// For PDFs (fallback to NGN if we can't embed Unicode-capable font)
function nairaForPdf(amount: number, pdfCanDrawNaira: boolean) {
  return pdfCanDrawNaira
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
    : `NGN ${new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)}`;
}

async function readPublic(relPath: string) {
  const abs = path.join(process.cwd(), "public", relPath.replace(/^\/+/, ""));
  return fs.readFile(abs);
}

async function loadFonts(pdf: PDFDocument) {
  pdf.registerFontkit(fontkit);

  // Guard: ensure we are reading a real TTF/OTF (not HTML/WOFF)
  function looksLikeTTF(buf: Buffer) {
    // TTF starts with 0x00010000, OTF starts with 'OTTO'
    return (
      (buf.length > 4 &&
        buf[0] === 0x00 &&
        buf[1] === 0x01 &&
        buf[2] === 0x00 &&
        buf[3] === 0x00) ||
      (buf.length > 4 &&
        buf[0] === 0x4f && // 'O'
        buf[1] === 0x54 && // 'T'
        buf[2] === 0x54 && // 'T'
        buf[3] === 0x4f)   // 'O'
    );
  }

  try {
    const regPath = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
    const regBytes = await fs.readFile(regPath);
    if (!looksLikeTTF(regBytes)) throw new Error("Regular font is not TTF/OTF");

    const noto = await pdf.embedFont(regBytes, { subset: true });

    let notoB = noto;
    try {
      const boldPath = path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf");
      const boldBytes = await fs.readFile(boldPath);
      if (!looksLikeTTF(boldBytes)) throw new Error("Bold font is not TTF/OTF");
      notoB = await pdf.embedFont(boldBytes, { subset: true });
    } catch {
      // fall back to regular if bold missing
      notoB = noto;
    }

    return { noto, notoB, pdfCanDrawNaira: true as const };
  } catch {
    // Final fallback: built-in Helvetica (doesn't support ₦ reliably)
    const noto = await pdf.embedFont(StandardFonts.Helvetica);
    const notoB = await pdf.embedFont(StandardFonts.HelveticaBold);
    return { noto, notoB, pdfCanDrawNaira: false as const };
  }
}

async function makePdf(payload: QuotePayload) {
  const pdf = await PDFDocument.create();
  const width = 595.28;  // A4 width (pt)
  const height = 841.89; // A4 height (pt)
  const page = pdf.addPage([width, height]);
  const margin = 40;

  const { noto, notoB, pdfCanDrawNaira } = await loadFonts(pdf);

  // Optional logo
  try {
    const logoBytes = await readPublic("/logo.png");
    const img = await pdf.embedPng(logoBytes);
    const loW = 56;
    const loH = (img.height / img.width) * loW;
    page.drawImage(img, { x: margin, y: height - margin - loH, width: loW, height: loH });
  } catch {}

  // Header
  page.drawText(process.env.COMPANY_NAME || "Volt Designs & Acoustics", {
    x: margin + 70,
    y: height - margin - 18,
    size: 16,
    font: notoB,
    color: rgb(0.95, 0.8, 0.2), // gold
  });
  page.drawText("Invoice / Quote", {
    x: width - margin - 140,
    y: height - margin - 18,
    size: 14,
    font: notoB,
    color: rgb(0, 0, 0),
  });

  const lineY = height - margin - 30;
  page.drawLine({
    start: { x: margin, y: lineY },
    end: { x: width - margin, y: lineY },
    thickness: 1,
    color: rgb(1, 1, 1),
  });

  // Meta
  const metaY = lineY - 18;
  const today = new Date();
  const invNo = `VDA-${today.getFullYear()}${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}-${Math.floor(
    Math.random() * 9000 + 1000
  )}`;

  const companyBlock = [
    process.env.COMPANY_ADDRESS || "",
    `Phone: ${process.env.COMPANY_PHONE || ""}`,
    `Email: ${process.env.COMPANY_EMAIL || ""}`,
  ]
    .filter(Boolean)
    .join("\n");

  page.drawText(companyBlock, { x: margin, y: metaY, size: 10, font: noto, color: rgb(0, 0, 0) });
  page.drawText(`Invoice #: ${invNo}`, {
    x: width - margin - 200,
    y: metaY,
    size: 10,
    font: noto,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Date: ${today.toLocaleDateString()}`, {
    x: width - margin - 200,
    y: metaY - 14,
    size: 10,
    font: noto,
    color: rgb(0, 0, 0),
  });

  // Bill To
  let y = metaY - 50;
  page.drawText("Bill To:", { x: margin, y, size: 12, font: notoB, color: rgb(0, 0, 0) });
  y -= 16;
  page.drawText(`${payload.clientName}`, { x: margin, y, size: 11, font: noto, color: rgb(0, 0, 0) });
  y -= 14;
  page.drawText(`${payload.email}`, { x: margin, y, size: 10, font: noto, color: rgb(0, 0, 0) });

  // Project
  y -= 22;
  page.drawText("Project:", { x: margin, y, size: 12, font: notoB, color: rgb(0, 0, 0) });
  y -= 16;
  page.drawText(payload.projectName || "—", { x: margin, y, size: 11, font: noto, color: rgb(0, 0, 0) });

  // Items
  y -= 28;
  page.drawText("Items / Notes:", { x: margin, y, size: 12, font: notoB, color: rgb(0, 0, 0) });
  y -= 16;
  const items = [...(payload.selectedSlugs || []), ...(payload.selectedPaths || [])];
  const itemsText = items.length ? items.join(", ") : "—";
  page.drawText(itemsText.slice(0, 1000), {
    x: margin,
    y,
    size: 10,
    font: noto,
    color: rgb(0, 0, 0),
    maxWidth: width - margin * 2,
  });

  // Totals
  y -= 40;
  page.drawText("Summary", { x: margin, y, size: 12, font: notoB, color: rgb(0, 0, 0) });
  y -= 18;
  const modeText = payload.billingMode === "sqm" ? `Area: ${payload.sqm ?? 0} sqm` : `Boards: ${payload.boards ?? 0}`;
  const fulfillText = `Fulfillment: ${payload.fulfillment}`;
  page.drawText(modeText, { x: margin, y, size: 10, font: noto, color: rgb(0, 0, 0) });
  y -= 14;
  page.drawText(fulfillText, { x: margin, y, size: 10, font: noto, color: rgb(0, 0, 0) });

  // Total
  const total = payload.estimate;
  y -= 30;
  page.drawText("Estimated Total:", { x: width - margin - 200, y, size: 12, font: notoB, color: rgb(0, 0, 0) });
  page.drawText(nairaForPdf(total, pdfCanDrawNaira), {
    x: width - margin - 200,
    y: y - 18,
    size: 16,
    font: notoB,
    color: rgb(0.95, 0.8, 0.2),
  });

  // Bank details
  y -= 60;
  page.drawText("Payment Details", { x: margin, y, size: 12, font: notoB, color: rgb(0, 0, 0) });
  y -= 16;
  page.drawText(
    `${process.env.COMPANY_BANK_NAME || "Bank"} — ${process.env.COMPANY_ACCOUNT_NAME || "Account Name"}`,
    { x: margin, y, size: 10, font: noto, color: rgb(0, 0, 0) }
  );
  y -= 14;
  page.drawText(`Account No: ${process.env.COMPANY_ACCOUNT_NUMBER || "—"}`, {
    x: margin,
    y,
    size: 10,
    font: noto,
    color: rgb(0, 0, 0),
  });

  // Footer
  page.drawLine({
    start: { x: margin, y: 60 },
    end: { x: width - margin, y: 60 },
    thickness: 0.5,
    color: rgb(1, 1, 1),
  });
  page.drawText("Thank you for choosing Volt Designs & Acoustics.", {
    x: margin,
    y: 45,
    size: 10,
    font: noto,
    color: rgb(0.2, 0.2, 0.2),
  });

  const bytes = await pdf.save();
  return { bytes, filename: `VDA-QUOTE.pdf`, invNo, total };
}

function emailHtml(payload: QuotePayload, invNo: string) {
  const payLink = process.env.PAYSTACK_PAYMENT_LINK;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "");

  return `
    <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif; color:#111; background:#f7f7f7; padding:24px">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
        <tr>
          <td style="padding:20px 24px; background:#000; color:#f5d66b;">
            <div style="display:flex;align-items:center;gap:12px">
              ${siteUrl ? `<img src="${siteUrl}/logo.png" width="32" height="32" style="border-radius:6px" alt="Logo" />` : ""}
              <div style="font-weight:700">Volt Designs & Acoustics</div>
            </div>
          </td>
        </tr>

        <tr><td style="padding:24px">
          <h2 style="margin:0 0 8px 0;">Invoice / Quote: ${invNo}</h2>
          <p style="margin:0 0 16px 0; color:#444">Hi ${payload.clientName || "there"}, please find your quote attached as a PDF.</p>

          <div style="margin:16px 0;padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa">
            <div><strong>Project:</strong> ${payload.projectName || "—"}</div>
            <div><strong>Mode:</strong> ${
              payload.billingMode === "sqm" ? `${payload.sqm ?? 0} sqm` : `${payload.boards ?? 0} boards`
            }</div>
            <div><strong>Fulfillment:</strong> ${payload.fulfillment}</div>
            <div><strong>Selected:</strong> ${[...(payload.selectedSlugs||[]), ...(payload.selectedPaths||[])].join(", ") || "—"}</div>
            <div style="margin-top:8px"><strong>Estimate:</strong> ${naira(payload.estimate)}</div>
          </div>

          ${
            payLink
              ? `<p style="margin:12px 0 24px 0">
                  <a href="${payLink}" style="display:inline-block;background:#f5d66b;color:#000;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:600">Pay with Paystack</a>
                </p>`
              : ""
          }

          <p style="margin:0 0 4px 0; font-weight:600">Company</p>
          <p style="margin:0 0 2px 0">${process.env.COMPANY_NAME || "Volt Designs & Acoustics"}</p>
          <p style="margin:0 0 2px 0">${process.env.COMPANY_ADDRESS || ""}</p>
          <p style="margin:0 0 2px 0">Phone: ${process.env.COMPANY_PHONE || ""}</p>
          <p style="margin:0 0 2px 0">Email: ${process.env.COMPANY_EMAIL || ""}</p>

          <p style="margin:16px 0 0 0; color:#666; font-size:12px">
            Bank: ${process.env.COMPANY_BANK_NAME || ""} • ${process.env.COMPANY_ACCOUNT_NAME || ""} • ${process.env.COMPANY_ACCOUNT_NUMBER || ""}
          </p>
        </td></tr>
      </table>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const body: QuotePayload = await req.json();

    if (!body?.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Build PDF (robust font loading)
    const { bytes, filename, invNo } = await makePdf(body);

    // Send email with Resend (lazy init)
    const resend = getResend();
    const from = process.env.INVOICE_FROM_EMAIL || "invoices@example.com";
    const html = emailHtml(body, invNo);

    await resend.emails.send({
      from,
      to: body.email,
      subject: `Quote ${invNo} — ${process.env.COMPANY_NAME || "Volt Designs & Acoustics"}`,
      html,
      attachments: [
        {
          filename,
          content: Buffer.from(bytes).toString("base64"),
        },
      ],
    });

    return NextResponse.json({ ok: true, invNo });
  } catch (err: any) {
    console.error("request-quote error:", err);
    const msg = err?.message || "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
