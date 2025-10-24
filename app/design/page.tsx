import Link from "next/link";

export default function DesignHubPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold">Choose Design Type</h1>
      <p className="text-sm text-gray-600 mt-1">
        Start with a design category. You can mix materials on the next step.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card title="Interior Design" href="/design/interior" desc="Walls, panels, trims—indoor aesthetics." />
        <Card title="Exterior Design" href="/design/exterior" desc="ACP, WPC, or both—façades & trims." />
        <Card title="Acoustics" href="/design/acoustics" desc="Reflectors, diffusers, soundproof doors." />
      </div>
    </main>
  );
}

function Card({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <Link href={href} className="rounded-2xl border p-4 hover:shadow-md transition block">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
      <div className="text-sm mt-3 underline">Get started →</div>
    </Link>
  );
}
