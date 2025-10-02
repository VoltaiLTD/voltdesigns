"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { listByDesign, type CatalogItem } from "@/lib/catalog";

export default function AcousticsStepPage() {
  const r = useRouter();
  const items = useMemo(() => listByDesign("acoustics"), []);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function onContinue() {
    if (!selected.length) {
      alert("Select one or more acoustic materials.");
      return;
    }
    r.push(`/ai-design-visualizer?type=acoustics&materials=${encodeURIComponent(selected.join(","))}`);
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Acoustics — choose materials</h1>
      <p className="text-sm text-gray-600 mt-1">Pick any combination: reflectors, diffusers, soundproof doors.</p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {items.map((m: CatalogItem) => (
          <button
            key={m.slug}
            type="button"
            onClick={() => toggle(m.slug)}
            className={`rounded-2xl overflow-hidden border text-left ${
              selected.includes(m.slug) ? "ring-2 ring-blue-500" : ""
            }`}
            title={m.description}
          >
            <Image src={m.image} alt={m.name} width={400} height={300} className="w-full h-auto object-cover" />
            <div className="p-2">
              <div className="text-sm font-medium">{m.name}</div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{m.description}</div>
            </div>
          </button>
        ))}
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
