import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import QRCode from "qrcode";

export const runtime = "edge";

// Define a type for the incoming request body for better type safety
type Totals = {
  materialCost: number;
  installCost: number;
  subtotal: number;
  vat: number;
  total: number;
  VAT_RATE: number;
  CURRENCY: string;
};

interface RequestBody {
  customerName?: string;
  email?: string;
  phone?: string;
  projectName?: string;
  siteAddress?: string;
  category?: string;
  productName?: string;
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
}

// Brand colors
const GOLD = rgb(212 / 255, 175 / 255, 55 / 255); // #D4AF37
const MUTED = rgb(0.75, 0.75, 0.75);
const TEXT = rgb(0.98, 0.98, 0.98);
const BAND = rgb(0.12, 0.12, 0.12);

export async function POST(req: Request) {
  try {
    const data: RequestBody = await req.json();

    const {
      customerName,
      email,
      phone,
      projectName,
      siteAddress,
      category,
      productName,
      billingMode,
      computedArea,
      boardsQty,
      pricePerM2,
      pricePerBoard,
      fulfillment,
      installRatePerM2,
      notes,
      totals,
    } = data;

    // ── Company / bank config (EDIT THESE) ──────────────────────────────────────
    const COMPANY = {
      name: "Volt Designs & Acoustics",
      email: "hello@volt-acoustics.com",
      phone: "+234 800 000 0000",
      addressLine: "Awoyaya, Lagos, Nigeria",
      website: "volt-acoustics.com",
      tin: "1234567890", // 👈 Tax Identification Number
      bank: {
        bankName: "Your Bank PLC",
        acctName: "Volt Designs & Acoustics",
        acctNumber: "0123456789",
        swift: "YRBKNGLA",
      },
    };

    const PAYMENT_URL =
      process.env.PAYMENT_URL ||
      `${new URL(req.url).origin}/get-a-quote`; // fallback if not set

    // ── Create PDF ──────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Try to embed logo
    let logoImg = null;
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      const res = await fetch(`${base}/logo.png`);
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        logoImg = await pdfDoc.embedPng(bytes);
      }
    } catch (e) {
      console.warn("Could not embed logo:", e);
    }

    // Helpers
    let y = 805;
    const left = 40;
    const right = 555;

    const text = (
      txt: string,
      opts: { x?: number; y?: number; size?: number; font?: PDFFont; color?: any } = {}
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

    // ── Header band with gold rule ─────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: 810, width: 595.28, height: 12, color: GOLD });

    if (logoImg) {
      const logoW = 46;
      const scale = logoW / logoImg.width;
      const logoH = logoImg.height * scale;
      page.drawImage(logoImg, { x: left, y: y - logoH + 14, width: logoW, height: logoH });
    }

    text(COMPANY.name, { x: left + 56, y, size: 16, font: bold });
    y -= 18;
    text(COMPANY.addressLine, { x: left + 56, size: 9, color: MUTED });
    text(`${COMPANY.email} • ${COMPANY.phone}`, { x: left + 56, size: 9, color: MUTED });
    text(`${COMPANY.website} • TIN: ${COMPANY.tin}`, { x: left + 56, size: 9, color: MUTED });

    y -= 4;
    page.drawLine({ start: { x: left, y }, end: { x: right, y }, color: GOLD, thickness: 1.2 });
    y -= 14;

    text("Quotation / Proforma Invoice", { size: 14, font: bold });
    // Dynamically sets the date to the current date, e.g., 25/09/2025
    text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { color: MUTED });
    y -= 10;

    text("Bill To:", { size: 12, font: bold });
    text(`${customerName || "-"}`);
    text(`${email || "-"}`);
    text(`${phone || "-"}`);
    text(`${siteAddress || "-"}`);
    y -= 10;

    // ── Details table ──────────────────────────────────────────────────────────
    const colX = {
      item: left + 10,
      desc: left + 160,
      qty: left + 340,
      unit: left + 390,
      amount: right - 10,
    };
    const rowH = 22;

    const headerRow = () => {
      page.drawRectangle({ x: left, y: y - 4, width: right - left, height: rowH, color: BAND });
      const headerY = y + 2;
      page.drawText("Item", { x: colX.item, y: headerY, size: 10, font: bold });
      page.drawText("Description", { x: colX.desc, y: headerY, size: 10, font: bold });
      page.drawText("Qty", { x: colX.qty, y: headerY, size: 10, font: bold });
      page.drawText("Unit Price", { x: colX.unit, y: headerY, size: 10, font: bold });
      page.drawText("Amount", { x: colX.amount - bold.widthOfTextAtSize("Amount", 10), y: headerY, size: 10, font: bold });
      y -= rowH + 4;
      page.drawLine({ start: { x: left, y: y + 2 }, end: { x: right, y: y + 2 }, color: GOLD, thickness: 0.8 });
    };

    const row = (item: string, desc: string, qty: string, unit: string, amount: string) => {
      page.drawText(item, { x: colX.item, y, size: 10 });
      page.drawText(desc, { x: colX.desc, y, size: 10 });
      page.drawText(qty, { x: colX.qty, y, size: 10 });
      page.drawText(unit, { x: colX.unit, y, size: 10 });
      page.drawText(amount, { x: colX.amount - font.widthOfTextAtSize(amount, 10), y, size: 10 });
      y -= rowH;
      page.drawLine({ start: { x: left, y: y + 8 }, end: { x: right, y: y + 8 }, color: rgb(0.22, 0.22, 0.22), thickness: 0.5 });
    };

    headerRow();

    const cur = totals?.CURRENCY || "₦";
    const formatCurrency = (num: number) => `${cur} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (billingMode === "sqm") {
      row(
        "Material",
        `${productName || "-"} (${category?.toUpperCase() || "-"})`,
        `${(computedArea ?? 0).toFixed(2)} m²`,
        formatCurrency(pricePerM2 || 0) + "/m²",
        formatCurrency(totals.materialCost)
      );
    } else {
      row(
        "Material",
        `${productName || "-"} (${category?.toUpperCase() || "-"})`,
        `${boardsQty || 0} boards`,
        formatCurrency(pricePerBoard || 0) + "/board",
        formatCurrency(totals.materialCost)
      );
    }

    if (fulfillment === "installation") {
      row(
        "Installation",
        "Labour & Logistics",
        billingMode === "sqm" ? `${(computedArea ?? 0).toFixed(2)} m²` : "1",
        installRatePerM2 ? formatCurrency(installRatePerM2) + "/m²" : "Lump Sum",
        formatCurrency(totals.installCost)
      );
    }

    if (notes) row("Notes", notes, "-", "-", "-");
    y -= 8;

    const totalsX = right - 220;
    const totalsW = 220;
    const totalsH = 80;
    page.drawRectangle({
      x: totalsX, y: y - totalsH + 20, width: totalsW, height: totalsH,
      color: BAND, borderColor: GOLD, borderWidth: 0.8,
    });
    
    const kv = (label: string, value: string, n: number, strong = false) => {
        const lineY = y + 74 - n * 22;
        const currentFont = strong ? bold : font;
        page.drawText(label, { x: totalsX + 10, y: lineY, size: 10, font, color: TEXT });
        page.drawText(value, {
            x: totalsX + totalsW - 10 - currentFont.widthOfTextAtSize(value, 10),
            y: lineY, size: 10, font: currentFont, color: strong ? GOLD : TEXT,
        });
    };

    kv("Subtotal:", formatCurrency(totals.subtotal), 1);
    kv(`VAT (${totals.VAT_RATE}%):`, formatCurrency(totals.vat), 2);
    kv("Total:", formatCurrency(totals.total), 3, true);

    y -= totalsH + 10;

    const footerY = 140;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(PAYMENT_URL, { margin: 1, width: 90, color: { dark: "#000000", light: "#FFFFFF00" } });
      const qrBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
      const qrImg = await pdfDoc.embedPng(qrBytes);
      const qrSize = 80;
      page.drawImage(qrImg, { x: right - qrSize, y: footerY - 15, width: qrSize, height: qrSize });
      page.drawText("Scan to Pay Online", { x: right - qrSize, y: footerY + 70, size: 9, font: bold, color: GOLD });
    } catch (e) {
      console.warn("Could not render QR Code:", e);
    }
    
    text("Terms & Notes", { y: footerY + 20, size: 11, font: bold, color: GOLD });
    text("• This quotation is valid for 14 days.", { y: footerY + 5, size: 8, color: MUTED });
    text("• Payment is required prior to dispatch unless otherwise agreed.", { y: footerY - 5, size: 8, color: MUTED });
    
    text("Payment Details", { y: footerY - 30, size: 11, font: bold, color: GOLD });
    text(`Bank: ${COMPANY.bank.bankName}`, { y: footerY - 45, size: 9 });
    text(`Account Name: ${COMPANY.bank.acctName}`, { y: footerY - 55, size: 9 });
    text(`Account Number: ${COMPANY.bank.acctNumber}`, { y: footerY - 65, size: 9 });

    // ── Save PDF and Return Response ──────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();

    const filename = `${(customerName || "client").toLowerCase().replace(/\s+/g, "-")}-${
      (projectName || "quote").toLowerCase().replace(/\s+/g, "-")
    }.pdf`;

    // ▼▼▼ FIX: Use a type assertion `as ArrayBuffer` to resolve the deep type conflict. ▼▼▼
    return new NextResponse(pdfBytes.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });

  } catch (err: any) {
    console.error("Invoice generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}