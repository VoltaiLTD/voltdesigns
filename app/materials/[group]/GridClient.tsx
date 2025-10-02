"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = { slug: string; name: string; image: string };
type Group = "acp" | "wpc" | "acoustics";

const GROUP_LABEL: Record<Group, string> = {
  acp: "ACP",
  wpc: "WPC",
  acoustics: "Acoustics",
};

export default function GridClient({
  items,
  group,
}: {
  items: Item[];
  group: Group;
}) {
  const r = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function applySelection() {
    if (!selected.length) return alert("Select one or more materials first.");
    // Map selected slugs to image paths
    const paths = selected
      .map((s) => items.find((i) => i.slug === s)?.image)
      .filter(Boolean) as string[];
    r.push(`/ai-design-visualizer?images=${encodeURIComponent(paths.join(","))}`);
  }

  return (
    <main className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">{GROUP_LABEL[group]}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Pick one or more to use in your AI design.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/materials" className="text-sm underline">
            ← Material options
          </Link>
          <button
            onClick={applySelection}
            className="inline-flex items-center rounded-xl px-4 py-2 border shadow hover:shadow-md disabled:opacity-60"
            disabled={!selected.length}
            title={selected.length ? `Apply ${selected.length} item(s)` : "Pick materials below"}
          >
            Apply {selected.length || ""} selected in AI Visualizer →
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {items.map((m) => {
          const isPicked = selected.includes(m.slug);
          return (
            <div
              key={m.slug}
              className="rounded-2xl border overflow-hidden hover:shadow-md transition flex flex-col"
            >
              <Image
                src={m.image}
                alt={m.name}
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
              />
              <div className="p-3 flex-1">
                <h2 className="text-base font-medium">{m.name}</h2>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                {/* One-click use */}
                <Link
                  href={`/ai-design-visualizer?images=${encodeURIComponent(
                    m.image
                  )}`}
                  className="text-[12px] underline"
                  title="Open AI Visualizer with this material"
                >
                  Use this in AI
                </Link>

                {/* Multi-select toggle */}
                <button
                  type="button"
                  onClick={() => toggle(m.slug)}
                  className={`text-[12px] px-3 py-1 rounded-full border ${
                    isPicked ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                  }`}
                  aria-pressed={isPicked}
                  title="Select multiple then apply all"
                >
                  {isPicked ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
