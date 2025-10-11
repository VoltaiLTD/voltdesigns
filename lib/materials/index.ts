// lib/materials/index.ts
export type MaterialCategory =
  | "reflector"
  | "diffuser"
  | "soundproof-door"
  | "cladding";

export type Material = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  specs: Record<string, string | number>;
  catalogueUrl?: string;
  category: MaterialCategory;
};

export const MATERIALS: Material[] = [
  {
    slug: "acp-perforated-reflector-silver",
    name: "ACP Perforated Reflector (Silver)",
    description: "Aluminum composite acoustic reflector panel with tuned perforations for large halls/churches.",
    image: "/materials/samples/acp-perforated-silver.jpg",
    specs: { Thickness: "4 mm", Core: "FR/PE options", Finish: "PVDF", "Sheet Size": "1220 × 2440 mm", Weight: "≈5.6 kg/m²" },
    catalogueUrl: "/catalogues/acp-perforated-reflector.pdf",
    category: "reflector",
  },
  {
    slug: "wpc-2d-diffuser-oak",
    name: "WPC 2D Diffuser (Oak)",
    description: "Wood-plastic composite slatted 2D diffuser for speech clarity and warm timber aesthetics.",
    image: "/materials/samples/wpc-oak.jpg",
    specs: { Profile: "156 × 21 mm slats", Material: "Wood fiber + HDPE", "Board Length": "2.9 m", NRC: "0.25–0.35 (with backing)" },
    catalogueUrl: "/catalogues/wpc-diffuser.pdf",
    category: "diffuser",
  },
  {
    slug: "acoustic-soundproof-door-stc35",
    name: "Acoustic Soundproof Door (STC 35–40)",
    description: "Steel acoustic door set with perimeter seals and drop-down threshold for treatment and studios.",
    image: "/materials/samples/soundproof-door.jpg",
    specs: { Leaf: "1.2 mm steel skins + mineral core", Frame: "Pressed steel", Seals: "Perimeter + automatic drop seal", Rating: "STC 35–40 (lab)" },
    catalogueUrl: "/catalogues/soundproof-door.pdf",
    category: "soundproof-door",
  },
  {
    slug: "acp-brushed-gold",
    name: "ACP Brushed Gold",
    description: "Premium brushed ACP for trims and features.",
    image: "/materials/samples/acp-brushed-gold.jpg",
    specs: { Thickness: "4 mm", Finish: "Brushed PVDF" },
    category: "cladding",
  },
];

export function getMaterial(slug: string) {
  return MATERIALS.find((m) => m.slug === slug);
}

// Samples used by the AI visualizer
export type MaterialSample = {
  id: string;        // slug as id
  slug: string;
  name: string;
  sampleImage: string;
  category: MaterialCategory;
  notes?: string;
};

export const MATERIAL_SAMPLES: MaterialSample[] = MATERIALS.map((m) => ({
  id: m.slug,
  slug: m.slug,
  name: m.name,
  sampleImage: m.image || "/placeholder.png",
  category: m.category,
  notes: m.description,
}));

export function getSample(id: string) {
  return MATERIAL_SAMPLES.find((s) => s.id === id);
}
