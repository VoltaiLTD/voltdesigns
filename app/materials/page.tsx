// app/materials/page.tsx
import Link from "next/link";
import Image from "next/image";
import { MATERIALS } from "./_data";

export const metadata = {
  title: "Materials — Volt Designs & Acoustics",
  description: "Explore ACP, WPC, and Acoustic materials with multiple images and finishes.",
};

export default function MaterialsPage() {
  return (
    <section className="section container">
      <h1>Materials</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        Browse our ACP, WPC, and Acoustic products — each with multiple images and finishes.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {MATERIALS.map((mat) => {
          const preview = mat.images?.[0] ?? "/placeholder/material.jpg"; // safe fallback
          return (
            <Link
              key={mat.slug}
              href={`/materials/${mat.slug}`}
              className="card hover:border-white/20 transition flex flex-col"
            >
              <div className="relative w-full h-40 rounded-md overflow-hidden bg-black/20">
                <Image
                  src={preview}
                  alt={mat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold mt-3">{mat.name}</h3>
              <p className="text-white/60 text-sm mt-1">{mat.description}</p>
              <div className="mt-2 text-[color:var(--gold,#D4AF37)] text-sm">
                View {mat.images?.length ?? 0} images →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
