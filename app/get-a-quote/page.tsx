"use client";

import React, { useMemo, useState } from "react";

type BillingMode = "sqm" | "board";
type Fulfillment = "installation" | "delivery";

export default function GetAQuotePage() {
  // Customer
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Project
  const [projectName, setProjectName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

  // Product
  const [category, setCategory] = useState<"acp" | "wpc" | "acoustic">("acp");
  const [productName, setProductName] = useState("");
  const [billingMode, setBillingMode] = useState<BillingMode>("sqm");

  // Dimensions (meters) for m² billing
  const [widthM, setWidthM] = useState<number | "">("");
  const [heightM, setHeightM] = useState<number | "">("");
  const [areaM2, setAreaM2] = useState<number | "">(""); // allow manual entry

  // Boards for per-board billing
  const [boardsQty, setBoardsQty] = useState<number | "">("");
  const [pricePerBoard, setPricePerBoard] = useState<number | "">("");

  // Pricing
  const [pricePerM2, setPricePerM2] = useState<number | "">("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("installation");
  const [installRatePerM2, setInstallRatePerM2] = useState<number | "">(""); // optional
  const [notes, setNotes] = useState("");

  // Company defaults (edit to taste)
  const VAT_RATE = 0; // e.g. 0.075 for 7.5%
  const CURRENCY = "₦"; // Naira

  // computed area if width/height provided
  const computedArea = useMemo(() => {
    if (billingMode === "sqm") {
      if (typeof areaM2 === "number" && areaM2 > 0) return areaM2;
      const w = typeof widthM === "number" ? widthM : 0;
      const h = typeof heightM === "number" ? heightM : 0;
      const a = w * h;
      return Number.isFinite(a) && a > 0 ? Number(a) : 0;
    }
    return 0;
  }, [billingMode, widthM, heightM, areaM2]);

  // calculations
  const materialCost = useMemo(() => {
    if (billingMode === "sqm") {
      const p = typeof pricePerM2 === "number" ? pricePerM2 : 0;
      return computedArea * p;
    } else {
      const qty = typeof boardsQty === "number" ? boardsQty : 0;
      const p = typeof pricePerBoard === "number" ? pricePerBoard : 0;
      return qty * p;
    }
  }, [billingMode, computedArea, pricePerM2, boardsQty, pricePerBoard]);

  const installCost = useMemo(() => {
    if (fulfillment !== "installation") return 0;
    const rate = typeof installRatePerM2 === "number" ? installRatePerM2 : 0;
    // apply installation only to area jobs; for board jobs, you can decide your own rule
    if (billingMode === "sqm") return (computedArea || 0) * rate;
    // simple per-board install: rate interpreted as per m²; adjust if you have board area
    return 0;
  }, [fulfillment, billingMode, computedArea, installRatePerM2]);

  const subtotal = useMemo(() => materialCost + installCost, [materialCost, installCost]);
  const vat = useMemo(() => subtotal * VAT_RATE, [subtotal]);
  const total = useMemo(() => subtotal + vat, [subtotal, vat]);

  async function handleGenerateInvoice() {
    // Basic validation
    if (!customerName || !productName) {
      alert("Please enter customer name and product name.");
      return;
    }
    if (billingMode === "sqm" && !(computedArea > 0 && typeof pricePerM2 === "number")) {
      alert("Please enter area (or width & height) and price per m².");
      return;
    }
    if (billingMode === "board" && !(typeof boardsQty === "number" && typeof pricePerBoard === "number")) {
      alert("Please enter number of boards and price per board.");
      return;
    }

    const payload = {
      customerName,
      email,
      phone,
      projectName,
      siteAddress,
      category,
      productName,
      billingMode,
      widthM: typeof widthM === "number" ? widthM : null,
      heightM: typeof heightM === "number" ? heightM : null,
      computedArea,
      boardsQty: typeof boardsQty === "number" ? boardsQty : null,
      pricePerM2: typeof pricePerM2 === "number" ? pricePerM2 : null,
      pricePerBoard: typeof pricePerBoard === "number" ? pricePerBoard : null,
      fulfillment,
      installRatePerM2: typeof installRatePerM2 === "number" ? installRatePerM2 : null,
      notes,
      totals: { materialCost, installCost, subtotal, vat, total, VAT_RATE, CURRENCY },
    };

    const res = await fetch("/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      alert(msg?.error || `Failed to generate invoice (${res.status})`);
      return;
    }

    // Download the PDF
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const niceName = `${customerName || "client"}-${projectName || "quote"}.pdf`.replace(/\s+/g, "-");
    a.href = url;
    a.download = niceName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section container">
      <h1>Get a Quote</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        Choose your billing method and fulfillment option. You can download a detailed invoice instantly.
      </p>

      {/* FORM */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Left: form */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold">Customer</h3>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <input className="input" placeholder="Full name" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} />
              <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input className="input" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Project</h3>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <input className="input" placeholder="Project name" value={projectName} onChange={(e)=>setProjectName(e.target.value)} />
              <input className="input" placeholder="Site address" value={siteAddress} onChange={(e)=>setSiteAddress(e.target.value)} />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Product & Billing</h3>
            <div className="grid md:grid-cols-4 gap-3 mt-3">
              <select className="input" value={category} onChange={(e)=>setCategory(e.target.value as any)}>
                <option value="acp">ACP</option>
                <option value="wpc">WPC</option>
                <option value="acoustic">Acoustic</option>
              </select>
              <input className="input md:col-span-3" placeholder="Product name / color / code" value={productName} onChange={(e)=>setProductName(e.target.value)} />
            </div>

            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input type="radio" name="mode" checked={billingMode==="sqm"} onChange={()=>setBillingMode("sqm")} />
                  <span>Bill per m²</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="mode" checked={billingMode==="board"} onChange={()=>setBillingMode("board")} />
                  <span>Bill per board</span>
                </label>
              </div>
            </div>

            {billingMode === "sqm" ? (
              <div className="grid md:grid-cols-4 gap-3 mt-3">
                <input className="input" type="number" step="0.01" placeholder="Width (m)" value={widthM as any} onChange={(e)=>setWidthM(e.target.value ? parseFloat(e.target.value) : "")} />
                <input className="input" type="number" step="0.01" placeholder="Height (m)" value={heightM as any} onChange={(e)=>setHeightM(e.target.value ? parseFloat(e.target.value) : "")} />
                <input className="input" type="number" step="0.01" placeholder="Area (m²)" value={areaM2 as any} onChange={(e)=>setAreaM2(e.target.value ? parseFloat(e.target.value) : "")} />
                <input className="input" type="number" step="0.01" placeholder="Price per m²" value={pricePerM2 as any} onChange={(e)=>setPricePerM2(e.target.value ? parseFloat(e.target.value) : "")} />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <input className="input" type="number" step="1" placeholder="Boards (qty)" value={boardsQty as any} onChange={(e)=>setBoardsQty(e.target.value ? parseInt(e.target.value) : "")} />
                <input className="input" type="number" step="0.01" placeholder="Price per board" value={pricePerBoard as any} onChange={(e)=>setPricePerBoard(e.target.value ? parseFloat(e.target.value) : "")} />
                <div className="input disabled:opacity-60" aria-disabled>Area N/A</div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold">Fulfillment</h3>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <select className="input" value={fulfillment} onChange={(e)=>setFulfillment(e.target.value as Fulfillment)}>
                <option value="installation">Installation</option>
                <option value="delivery">Product Delivery Only</option>
              </select>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="Install rate per m² (optional)"
                value={installRatePerM2 as any}
                onChange={(e)=>setInstallRatePerM2(e.target.value ? parseFloat(e.target.value) : "")}
                disabled={fulfillment !== "installation"}
              />
              <input className="input" placeholder="Notes (optional)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </div>
          </div>

          <button onClick={handleGenerateInvoice} className="btn btn-gold">
            Download Invoice (PDF)
          </button>
        </div>

        {/* Right: live summary */}
        <aside className="space-y-3">
          <div className="card">
            <h3 className="font-semibold">Summary</h3>
            <div className="mt-3 text-sm text-white/80 space-y-1">
              <div><span className="text-white/60">Mode:</span> {billingMode === "sqm" ? "Per m²" : "Per board"}</div>
              {billingMode === "sqm" ? (
                <>
                  <div><span className="text-white/60">Area:</span> {computedArea.toFixed(2)} m²</div>
                  <div><span className="text-white/60">Price/m²:</span> {CURRENCY} {Number(pricePerM2 || 0).toLocaleString()}</div>
                </>
              ) : (
                <>
                  <div><span className="text-white/60">Boards:</span> {Number(boardsQty || 0)}</div>
                  <div><span className="text-white/60">Price/board:</span> {CURRENCY} {Number(pricePerBoard || 0).toLocaleString()}</div>
                </>
              )}
              <div><span className="text-white/60">Material cost:</span> {CURRENCY} {materialCost.toLocaleString()}</div>
              <div><span className="text-white/60">Fulfillment:</span> {fulfillment === "installation" ? "Installation" : "Delivery only"}</div>
              <div><span className="text-white/60">Installation:</span> {CURRENCY} {installCost.toLocaleString()}</div>
              <div><span className="text-white/60">Subtotal:</span> {CURRENCY} {subtotal.toLocaleString()}</div>
              <div><span className="text-white/60">VAT:</span> {CURRENCY} {vat.toLocaleString()}</div>
              <div className="font-semibold"><span className="text-white/60">Total:</span> {CURRENCY} {total.toLocaleString()}</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
