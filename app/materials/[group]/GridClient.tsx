"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDraft } from "@/lib/quote/session";

type Props = {
  group: string;        // "acp" | "wpc" | "acoustic"
  items: string[];      // array of public image paths e.g. ["/materials/acoustic/acoustic-1.jpg", ...]
  title?: string;
  description?: string;
};

export default function GridClient({ group, items, title, description }: Props) {
  const router = useRouter();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  function toggle(path: string) {
    setSelectedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  }

  // 3B: One-click add to quote
  function selectAndQuote(path: string) {
    // Persist to the draft (so it shows even if the user navigates around)
    saveDraft?.({ selectedSlugs: [], selectedPaths: [path] });
    // Also pass via querystring (Get a Quote reads ?images=...)
    router.push(`/get-a-quote?images=${encodeURIComponent(path)}`);
  }

  // 3C: Multi-select, then proceed
  function proceedMulti() {
    if (!selectedPaths.length) return;
    saveDraft?.({ selectedSlugs: [], selectedPaths });
    const qs = new URLSearchParams();
    qs.set("images", selectedPaths.map(encodeURIComponent).join(","));
    router.push(`/get-a-quote?${qs.toString()}`);
  }

  const header = useMemo(() => {
    const labels: Record<string, string> = {
      acp: "ACP Finishes",
      wpc: "WPC Finishes",
      acoustic: "Acoustic Options",
    };
    return title || labels[group] || "Materials";
  }, [group, title]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">{header}</h1>
          {description && <p className="text-sm text-gray-600 max-w-2xl">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/" className="text-sm underline">Home</Link>
          <Link href="/materials" className="text-sm underline">All categories</Link>
          <Link href="/ai-design-visualizer" className="text-sm underline">AI Visualizer</Link>
        </div>
      </div>

      {/* Multi-select action bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          Selected: <b>{selectedPaths.length}</b>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!selectedPaths.length}
            onClick={proceedMulti}
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          >
            Proceed to Quote ({selectedPaths.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedPaths([])}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((p) => {
          const isSel = selectedPaths.includes(p);
          const label = p.split("/").pop() || p;
          return (
            <div key={p} className={`rounded-xl overflow-hidden border ${isSel ? "ring-2 ring-blue-500" : ""}`}>
              <button
                type="button"
                onClick={() => toggle(p)}
                className="block w-full text-left"
                title={label}
              >
                {/* Using <img> to avoid next/image config for public files */}
                <img src={p} alt={label} className="w-full h-40 object-cover" />
                <div className="px-2 py-1 text-xs">{label}</div>
              </button>

              <div className="flex items-center justify-between px-2 pb-2 gap-2">
                {/* 3B: One-click add to quote */}
                <button
                  type="button"
                  onClick={() => selectAndQuote(p)}
                  className="text-[12px] underline"
                  title="Add to quote and go"
                >
                  Select & Get Quote
                </button>
                <span className="text-[12px] opacity-70">{isSel ? "Selected" : "Tap to select"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
