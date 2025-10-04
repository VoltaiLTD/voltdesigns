// app/api/invoice/route.ts
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export const runtime = "nodejs";        // ⬅️ use Node (NOT edge)
export const dynamic = "force-dynamic"; // safe for server-only work

export async function POST(req: Request) {
  try {
    // Accept a simple invoice payload; tweak fields as you like
    const body = await req.json().catch(() => ({}));
    const {
      invoiceNo = "INV-0001",
      date = new Date().toISOString().slice(0, 10),
      billTo = "Customer Name\nCompany\nAddress",
      items = [] as Array<{ desc?: string; qty?: number; unitPrice?: number }>,
      note = "",
      currency = "₦",
      qrText = `Invoice ${invoiceNo}`,
    } = body ?? {};

    // Create PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    const margin = 50;
    const fs = 12;

    // Header
    page.drawText("INVOICE", { x: margin, y: height - margin, size: 24, font, color: rgb(0, 0, 0) });
    page.drawText(`No: ${invoiceNo}`, { x: margin, y: height - margin - 30, size: fs, font });
    page.drawText(`Date: ${date}`, { x: margin, y: height - margin - 48, size: fs, font });

    // Bill To
    page.drawText("Bill To:", { x: margin, y: height - margin - 80, size: fs, font });
    page.drawText(String(billTo), {
      x: margin,
      y: height - margin - 98,
      size: fs,
      font,
      lineHeight: 14,
      maxWidth: width - margin * 2,
    });

    // Table header
    let y = height - margin - 140;
    page.drawText("Description", { x: margin, y, size: fs, font });
    page.drawText("Qty", { x: width - margin - 140, y, size: fs, font });
    page.drawText("Unit", { x: width - margin - 90, y, size: fs, font });
    page.drawText("Amount", { x: width - margin - 40, y, size: fs, font });
    y -= 16;

    // Items
    let total = 0;
    (Array.isArray(items) ? items : []).forEach((it) => {
      const qty = Number(it?.qty ?? 0) || 0;
      const unit = Number(it?.unitPrice ?? 0) || 0;
      const amt = qty * unit;
      total += amt;

      const desc = String(it?.desc ?? "");
      page.drawText(desc, {
        x: margin,
        y,
        size: fs,
        font,
        maxWidth: width - margin * 2 - 200,
        lineHeight: 14,
      });
      page.drawText(String(qty), { x: width - margin - 140, y, size: fs, font });
      page.drawText(`${currency}${unit.toLocaleString()}`, { x: width - margin - 90, y, size: fs, font });
      page.drawText(`${currency}${amt.toLocaleString()}`, { x: width - margin - 40, y, size: fs, font });
      y -= 16;
    });

    // Total
    y -= 10;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 20;
    page.drawText(`Total: ${currency}${total.toLocaleString()}`, {
      x: width - margin - 200,
      y,
      size: 14,
      font,
    });

    // Notes
    if (note) {
      y -= 40;
      page.drawText("Notes:", { x: margin, y, size: fs, font });
      y -= 16;
      page.drawText(String(note), {
        x: margin,
        y,
        size: fs,
        font,
        maxWidth: width - margin * 2,
        lineHeight: 14,
      });
    }

    // QR: generate PNG and embed
    const qrPng = await QRCode.toBuffer(qrText, { type: "png", margin: 1, scale: 6 });
    const qrImage = await pdf.embedPng(qrPng);
    const qrSize = 120;
    page.drawImage(qrImage, { x: width - margin - qrSize, y: margin, width: qrSize, height: qrSize });

    const bytes = await pdf.save();
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoiceNo}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("invoice error:", err);
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
