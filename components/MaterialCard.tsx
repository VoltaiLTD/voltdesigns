import Link from "next/link";

// Define the shape of a single color variation
type MaterialVariation = {
  color: string;
  hex: string;
};

// Define the shape of the main material object
type Material = {
  slug: string;
  name: string;
  description: string;
  variations: MaterialVariation[];
};

// Define the props for the MaterialCard component
type MaterialCardProps = {
  material: Material;
};

export function MaterialCard({ material }: MaterialCardProps) {
  const { slug, name, description, variations } = material;
  const maxSwatches = 6;
  const extraSwatches = Math.max(0, variations.length - maxSwatches);

  return (
    <Link href={`/materials/${slug}`} className="card hover:border-white/20 transition">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-white/60 text-sm mt-2">{description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {variations.slice(0, maxSwatches).map((variant) => (
          <span
            key={variant.color}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20"
            title={variant.color}
            style={{ backgroundColor: variant.hex }}
            aria-label={variant.color} 
            role="img"
          />
        ))}
        {extraSwatches > 0 && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px]">
            +{extraSwatches}
          </span>
        )}
      </div>
      <div className="mt-3 text-sm text-[color:var(--gold,#D4AF37)]">View palette →</div>
    </Link>
  );
}