// app/materials/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Materials",
  description: "Pick a material category to browse all options.",
};

export default function MaterialsLanding() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold">Material options</h1>
      <p className="text-sm text-gray-600 mt-1">
        Choose a category to see all the materials available.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card title="ACP" href="/materials/acp" desc="Panels, trims, finishes" />
        <Card title="WPC" href="/materials/wpc" desc="Cladding, slats, panels" />
      <Card title="Acoustics" href="/materials/acoustics" desc="Reflectors, diffusers, doors" />
      </div>
    </main>
  );
}

function Card({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <Link href={href} className="rounded-2xl border p-4 hover:shadow-md transition block">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
      <div className="text-sm mt-3 underline">Browse →</div>
    </Link>
  );
}
