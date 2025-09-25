// app/materials/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { MATERIALS } from "../_data";

export async function generateStaticParams() {
  return MATERIALS.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const mat = MATERIALS.find((m) => m.slug === params.slug);
  return {
    title: mat ? `${mat.name} — Materials` : "Material",
    description: mat?.description ?? "Material details and gallery.",
  };
}

export default function MaterialDetail({
  params,
}: {
  params: { slug: string };
}) {
  const mat = MATERIALS.find((m) => m.slug === params.slug);
  if (!mat) return notFound();

  const images = mat.images?.length ? mat.images : ["/placeholder/material.jpg"];

  return (
    <section className="section container">
      <h1>{mat.name}</h1>
      <p className="text-white/70 mt-2 max-w-2xl">{mat.description}</p>

      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mt-6">
        {images.map((src, idx) => (
          <div key={src + idx} className="relative w-full h-40 rounded-md overflow-hidden bg-black/20">
            <Image
              src={src}
              alt={`${mat.name} ${idx + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
