
"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loadDraft, clearDraft } from "@/lib/quote/session";
import { CATALOG, type CatalogItem } from "@/lib/catalog";

type BillingMode = "sqm" | "board";
type Fulfillment = "installation" | "delivery";

const toBillingMode = (v: string): BillingMode =>
  v === "sqm" || v === "board" ? v : "sqm";

const toFulfillment = (v: string): Fulfillment =>
  v === "installation" || v === "delivery" ? v : "installation";

export default function GetAQuotePage() {
  const sp = useSearchParams();

  // preload from AI Visualizer (materials=slugs, images=/public paths)
  const materialsParam = sp.get("materials") || "";
  const imagesParam = sp.get("images") || "";

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");

  const [billingMode, setBillingMode] = useState<BillingMode>("sqm");
  const [sqm, setSqm] = useState<number>(0);
  const [boards, setBoards] = useState<number>(0);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("installation");

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  // hydrate from URL + any draft you stored before
  useEffect(() => {
    const ids = materialsParam.split(",").map(s => s.trim()).filter(Boolean);
    const imgs = imagesParam.split(",").map(s => decodeURIComponent(s.trim())).filter(Boolean);

    if (ids.length) setSelectedSlugs(ids);
    if (imgs.length) setSelectedPaths(imgs);

    const draft = loadDraft?.();
    if (draft) {
      setProjectName(draft.projectName ?? "");
      setClientName(draft.clientName ?? "");
      setEmail(draft.email ?? "");
      setBillingMode(toBillingMode(draft.billingMode ?? "sqm"));
      setSqm(typeof draft.sqm === "number" ? draft.sqm : 0);
      setBoards(typeof draft.boards === "number" ? draft.boards : 0);
      setFulfillment(toFulfillment(draft.fulfillment ?? "installation"));
      setSelectedSlugs(Array.isArray(draft.selectedSlugs) ? draft.selectedSlugs : ids);
      setSelectedPaths(Array.isArray(draft.selectedPaths) ? draft.selectedPaths : imgs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chosenFromCatalog: CatalogItem[] = useMemo(
    () => CATALOG.filter(c => selectedSlugs.includes(c.slug)),
    [selectedSlugs]
  );

  // simple estimate model (replace with your own)
  const estimate = useMemo(() => {
    const base = billingMode === "sqm" ? sqm * 25000 : boards * 18000; // NGN placeholders
    const complexity = selectedSlugs.length + selectedPaths.length;
    const multiplier = 1 + Math.min(0.15, complexity * 0.03);
    const fulfill = fulfillment === "installation" ? 1.2 : 1.0;
    return Math.round(base * multiplier * fulfill);
  }, [billingMode, sqm, boards, selectedSlugs.length, selectedPaths.length, fulfillment]);

  function onClear() {
    clearDraft?.();
    setProjectName(""); setClientName(""); setEmail("");
    setBillingMode("sqm"); setSqm(0); setBoards(0);
    setFulfillment("installation");
    setSelectedSlugs([]); setSelectedPaths([]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(
      `Quote requested!\n\nProject: ${projectName}\nClient: ${clientName}\nEmail: ${email}\n` +
      `Mode: ${billingMode} (${billingMode === "sqm" ? sqm + " sqm" : boards + " boards"})\n` +
      `Fulfillment: ${fulfillment}\n` +
      `Items: ${[...selectedSlugs, ...selectedPaths].join(", ") || "none"}\n` +
      `Estimated total: ₦${estimate.toLocaleString()}`
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 bg-white text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Get a Quote</h1>
        <nav className="flex gap-3">
          <Link href="/" className="text-sm underline text-gray-900">Home</Link>
          <Link href="/materials" className="text-sm underline text-gray-900">Material options</Link>
          <Link href="/ai-design-visualizer" className="text-sm underline text-gray-900">AI Visualizer</Link>
        </nav>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block text-gray-800">
            <span className="text-sm font-medium">Project name</span>
            <input
              className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900 placeholder-gray-500"
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
            />
          </label>
          <label className="block text-gray-800">
            <span className="text-sm font-medium">Client name</span>
            <input
              className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900 placeholder-gray-500"
              value={clientName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
            />
          </label>
          <label className="block md:col-span-2 text-gray-800">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900 placeholder-gray-500"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block text-gray-800">
            <span className="text-sm font-medium">Billing mode</span>
            <select
              className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900"
              value={billingMode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setBillingMode(toBillingMode(e.target.value))
              }
            >
              <option value="sqm">Per square meter (sqm)</option>
              <option value="board">Per board</option>
            </select>
          </label>

          {billingMode === "sqm" ? (
            <label className="block text-gray-800">
              <span className="text-sm font-medium">Area (sqm)</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900 placeholder-gray-500"
                value={sqm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSqm(Number(e.target.value) || 0)
                }
              />
            </label>
          ) : (
            <label className="block text-gray-800">
              <span className="text-sm font-medium">Boards</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900 placeholder-gray-500"
                value={boards}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBoards(Number(e.target.value) || 0)
                }
              />
            </label>
          )}

          <label className="block text-gray-800">
            <span className="text-sm font-medium">Fulfillment</span>
            <select
              className="mt-1 w-full border rounded-xl p-2 bg-white text-gray-900"
              value={fulfillment}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFulfillment(toFulfillment(e.target.value))
              }
            >
              <option value="installation">Installation</option>
              <option value="delivery">Delivery only</option>
            </select>
          </label>
        </div>

        {/* Selected items preview */}
        <div className="rounded-2xl border p-3 bg-white">
          <div className="text-sm font-medium text-gray-900">Selected items</div>
          <div className="text-xs text-gray-700">
            {[...selectedSlugs, ...selectedPaths].length ? (
              [...selectedSlugs, ...selectedPaths].join(", ")
            ) : (
              <>
                none (choose items in the{" "}
                <Link className="underline" href="/materials">Materials</Link> or{" "}
                <Link className="underline" href="/ai-design-visualizer">AI Visualizer</Link>)
              </>
            )}
          </div>
        </div>

        {/* Estimate */}
        <div className="rounded-2xl border p-3 bg-white">
          <div className="text-sm font-medium text-gray-900">Estimated total</div>
          <div className="text-lg text-gray-900">₦{estimate.toLocaleString()}</div>
          <div className="text-xs text-gray-600 mt-1">
            This is an instant estimate and may change after site measurement.
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl px-4 py-2 border shadow hover:shadow-md bg-white text-gray-900"
          >
            Request Quote
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl px-4 py-2 border bg-white text-gray-900"
          >
            Clear
          </button>
        </div>
      </form>
    </main>
  );
}
