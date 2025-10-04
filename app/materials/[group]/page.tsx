// app/materials/[group]/page.tsx
import GridClient from "./GridClient";

type Props = {
  params: { group: string };
};

// Map route param to your public folder structure
function listGroupImages(group: string): string[] {
  // Example: 8 images per category named "<group>-1.jpg" ... "<group>-8.jpg"
  // Adjust counts/names to match your actual files in /public/materials/<group>/...
  const countByGroup: Record<string, number> = {
    acp: 8,
    wpc: 8,
    acoustic: 8,
  };
  const n = countByGroup[group] ?? 0;
  return Array.from({ length: n }, (_, i) => `/materials/${group}/${group}-${i + 1}.jpg`);
}

export default function MaterialsGroupPage({ params }: Props) {
  const group = params.group; // "acp" | "wpc" | "acoustic"
  const items = listGroupImages(group);

  // Optional copy
  const copy: Record<string, { title: string; desc: string }> = {
    acp: {
      title: "ACP Finishes",
      desc: "Explore curated ACP finishes for exterior/interior cladding and trims.",
    },
    wpc: {
      title: "WPC Finishes",
      desc: "Warm, durable WPC options suited for wall and ceiling treatments.",
    },
    acoustic: {
      title: "Acoustic Options",
      desc: "Reflectors, diffusers, absorbers, and doors—pick what fits your space.",
    },
  };

  const meta = copy[group] || { title: "Materials", desc: "" };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <GridClient group={group} items={items} title={meta.title} description={meta.desc} />
    </main>
  );
}
