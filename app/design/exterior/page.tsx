"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExteriorStepPage() {
  const r = useRouter();
  const [acp, setAcp] = useState(true);
  const [wpc, setWpc] = useState(false);

  function onContinue() {
    if (!acp && !wpc) {
      alert("Pick ACP, WPC, or both.");
      return;
    }
    // Build tags param for filtering in the visualizer
    const tags = [acp ? "acp" : null, wpc ? "wpc" : null].filter(Boolean).join(",");
    r.push(`/ai-design-visualizer?type=exterior&tags=${encodeURIComponent(tags)}`);
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Exterior — pick materials</h1>
      <p className="text-sm text-gray-600 mt-1">Choose ACP, WPC, or both. You can still fine-tune inside the visualizer.</p>

      <div className="mt-6 space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={acp} onChange={(e) => setAcp(e.target.checked)} />
          <span>ACP</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={wpc} onChange={(e) => setWpc(e.target.checked)} />
          <span>WPC</span>
        </label>
      </div>

      <button
        onClick={onContinue}
        className="mt-6 inline-flex items-center rounded-xl px-4 py-2 border shadow hover:shadow-md"
      >
        Continue to AI Visualizer →
      </button>
    </main>
  );
}
