import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

const GOLD = rgb(212 / 255, 175 / 255, 55 / 255);
const MUTED = rgb(0.75, 0.75, 0.75);
const TEXT = rgb(0.98, 0.98, 0.98);
const BAND = rgb(0.12, 0.12, 0.12);

type Totals = {
  materialCost: number;
  installCost: number;
  subtotal: number;
  vat: number;
  total: number;
  VAT_RATE: number;
  CURRENCY: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      // Customer & project
      customerName,
      email,
      phone,
      projectName,
      siteAddress,

      // Visualizer selections
      category,         // "acp" | "wpc" | "acoustic"
      productName,      // we used the palette name here
      description,      // user idea (optional from visualizer)
      imageUrl,         // preview image URL (from visualizer)

      // Billing
      billingMode,      // "sqm" | "board"
      widthM,
      heightM,
      computedArea,
      boardsQty,
      pricePerM2,
      pricePerBoard,
      fulfillment,      // "installation" | "delivery"
      installRatePerM2,
      notes,

      // Totals
      totals,
    }: {
      customerName?: string;
      email?: string;
      phone?: string;
      projectName?: string;
      siteAddress?: string;
      category?: string;
      productName?: string;
      description?: string;
      imageUrl?: string;
      billingMode?: "sqm" | "board";
      widthM?: number | null;
      heightM?: number | null;
      computedArea?: number;
      boardsQty?: number | null;
      pricePerM2?: number | null;
      pricePerBoard?: number | null;
      fulfillment?: "installation" | "delivery";
      installRatePerM2?: number | null;
      notes?: string;
      totals: Totals;
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 });
    }

    // ───────────────────────
    // Build PDF with preview thumbnail embedded
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Try to fetch & embed your logo
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    let logoImg: any = null;
    try {
      const res = await fetch(`${origin}/logo.png`);
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        try { logoImg = await pdfDoc.embedPng(bytes); }
        catch { logoImg = await pdfDoc.embedJpg(bytes); }
      }
    } catch {}

    // Try to fetch & embed preview thumbnail (imageUrl from visualizer)
    let previewImg: any = null;
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        if (res.ok) {
          const bytes = await res.arrayBuffer();
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("png")) previewImg = await pdfDoc.embedPng(bytes);
          else previewImg = await pdfDoc.embedJpg(bytes);
        }
      } catch {}
    }

    let y = 805;
    const left = 40;
    const right = 555;

    const text = (
      txt: string,
      opts: { x?: number; y?: number; size?: number; font?: any; color?: any } = {}
    ) => {
      page.drawText(txt, {
        x: opts.x ?? left,
        y: opts.y ?? y,
        size: opts.size ?? 10,
        font: opts.font ?? font,
        color: opts.color ?? TEXT,
      });
      if (opts.y === undefined) y -= (opts.size ?? 10) + 6;
    };

    const rule = (color = MUTED, thickness = 0.5, gap = 10) => {
      page.drawLine({ start: { x: left, y }, end: { x: right, y }, color, thickness });
      y -= gap;
    };

    // Header band
    page.drawRectangle({ x: 0, y: 810, width: 595.28, height: 12, color: GOLD });

    if (logoImg) {
      const w = 46;
      const scale = w / logoImg.width;
      const h = logoImg.height * scale;
      page.drawImage(logoImg, { x: left, y: y - h + 14, width: w, height: h });
    }

    text("Volt Designs & Acoustics", { x: left + 56, y, size: 16, font: bold });
    y -= 18;
    text("Awoyaya, Lagos, Nigeria", { x: left + 56, size: 9, color: MUTED });
    text("hello@volt-acoustics.com • +234 800 000 0000", { x: left + 56, size: 9, color: MUTED });
    text("volt-acoustics.com • TIN: 1234567890", { x: left + 56, size: 9, color: MUTED });

    y -= 4;
    page.drawLine({ start: { x: left, y }, end: {
      x: right,
      y: 0
    }, color: GOLD, thickness: 1.2 });
    y -= 14;

    text("Quotation / Proforma Invoice", { size: 14, font: bold });
    text(`Date: ${new Date().toLocaleDateString()}`, { color: MUTED });
    rule();

    // Bill to
    text("Bill To:", { size: 12, font: bold });
    text(`${customerName || "-"}`);
    text(`${email || "-"}`);
    text(`${phone || "-"}`);
    text(`${siteAddress || "-"}`);
    rule();

    // Preview thumbnail (if available)
    if (previewImg) {
      const maxW = 240;
      const scale = maxW / previewImg.width;
      const w = maxW;
      const h = previewImg.height * scale;
      // Draw on right column area
      page.drawImage(previewImg, { x: right - w, y: y - h + 12, width: w, height: h });
    }

    // Details text
    const cur = totals?.CURRENCY || "₦";
    const detailsStartY = y;
    text("Details", { size: 12, font: bold });
    text(`Project: ${projectName || "-"}`);
    text(`Category: ${String(category || "-").toUpperCase()}`);
    text(`Palette/Product: ${productName || "-"}`);
    text(`Billing: ${billingMode === "sqm" ? "Per m²" : "Per board"}`);
    if (billingMode === "sqm") {
      text(`Dimensions (m): ${(widthM ?? "-")} × ${(heightM ?? "-")}`);
      text(`Area (m²): ${computedArea?.toFixed?.(2) ?? "-"}`);
      text(`Price/m²: ${cur} ${Number(pricePerM2 || 0).toLocaleString()}`);
    } else {
      text(`Boards: ${boardsQty ?? "-"}`);
      text(`Price/board: ${cur} ${Number(pricePerBoard || 0).toLocaleString()}`);
    }
    if (fulfillment === "installation") {
      text(
        `Installation rate: ${cur} ${Number(installRatePerM2 || 0).toLocaleString()}/m²`
      );
    }
    if (description) text(`Idea: ${description}`);
    if (notes) text(`Notes: ${notes}`);
    rule();

    // Totals box
    const totalsX = right - 190;
    const totalsW = 190;
    const totalsH = 100;
    page.drawRectangle({
      x: totalsX,
      y: y - totalsH + 20,
      width: totalsW,
      height: totalsH,
      color: BAND,
      borderColor: GOLD,
      borderWidth: 0.8,
    });

    const lineY = (n: number) => y + 94 - n * 20;
    const drawKV = (k: string, v: string, n: number, strong = false) => {
      page.drawText(k, { x: totalsX + 10, y: lineY(n), size: 10, font, color: TEXT });
      page.drawText(v, {
        x: totalsX + totalsW - 10 - Math.min(120, v.length * 5),
        y: lineY(n),
        size: 10,
        font: strong ? bold : font,
        color: strong ? GOLD : TEXT,
      });
    };

    drawKV("Subtotal:", `${cur} ${Number(totals?.subtotal || 0).toLocaleString()}`, 1);
    drawKV("VAT:", `${cur} ${Number(totals?.vat || 0).toLocaleString()}`, 2);
    drawKV("Total:", `${cur} ${Number(totals?.total || 0).toLocaleString()}`, 3, true);

    // Terms
    y -= totalsH + 30;
    text("Terms & Notes", { size: 12, font: bold, color: GOLD });
    text("• Valid 14 days. Payment prior to dispatch or as agreed. Lead times depend on stock & schedule.", { size: 9, color: MUTED });
    text("• Fire-rating certificates and compliance documentation available on request.", { size: 9, color: MUTED });

    // Save PDF as Uint8Array → Base64 for email attachment
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    const subject = `Quote — ${projectName || "Project"} — ${customerName || "Client"}`;

    const html = `
      <div style="font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
        <h2 style="margin:0 0 12px">Your Quote from Volt Designs & Acoustics</h2>
        <p>Hello ${customerName || "there"},</p>
        <p>Attached is your quotation (PDF) for <b>${projectName || "your project"}</b>.</p>
        <p><b>Summary</b></p>
        <ul>
          <li>Category: ${String(category || "-").toUpperCase()}</li>
          <li>Palette/Product: ${productName || "-"}</li>
          <li>Total: ${cur} ${(totals?.total || 0).toLocaleString()}</li>
        </ul>
        ${
          imageUrl
            ? `<p>Preview from your AI design:</p>
               <img src="${imageUrl}" alt="Preview" style="max-width:520px;border-radius:8px;border:1px solid #eee" />`
            : ""
        }
        <p style="margin-top:16px">If you have any questions, reply to this email. We’re happy to help.</p>
        <p style="margin-top:24px">– Volt Designs & Acoustics</p>
      </div>
    `;

    const from = process.env.FROM_EMAIL!;
    const toList = [email, process.env.INTERNAL_SALES_EMAIL || ""].filter(Boolean);

    const sendRes = await resend.emails.send({
      from,
      to: toList,
      subject,
      html,
      attachments: [
        {
          filename: `${(customerName || "client")
            .toLowerCase()
            .replace(/\s+/g, "-")}-${(projectName || "quote")
            .toLowerCase()
            .replace(/\s+/g, "-")}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (sendRes.error) {
      return NextResponse.json({ error: sendRes.error.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("quote-email error:", err?.message || err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
