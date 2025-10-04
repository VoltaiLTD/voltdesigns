// lib/catalog/index.ts

// Top-level design kinds
export type DesignKind = "interior" | "exterior" | "acoustics";

// Tags used to filter/compose options
export type MaterialTag = "acp" | "wpc" | "reflector" | "diffuser" | "soundproof-door";

// Catalog item (used for both browsing and AI samples)
export type CatalogItem = {
  slug: string;                 // unique id
  name: string;
  description: string;
  image: string;                // path under /public
  tags: MaterialTag[];          // categorize item
};

// Minimal interior sample (add more later if you want)
const INTERIOR: CatalogItem[] = [
  {
    slug: "interior-wpc-oak",
    name: "Interior WPC (Oak)",
    description: "Warm WPC slats for interior wall paneling.",
    image: "/materials/samples/wpc-oak.jpg",
    tags: ["wpc"],
  },
];

// Exterior items (ACP, WPC)
const EXTERIOR: CatalogItem[] = [
  {
    slug: "exterior-acp-brushed-gold",
    name: "Exterior ACP (Brushed Gold)",
    description: "Premium brushed ACP for trims/facades.",
    image: "/materials/samples/acp-brushed-gold.jpg",
    tags: ["acp"],
  },
  {
    slug: "exterior-wpc-cladding-oak",
    name: "Exterior WPC Cladding (Oak)",
    description: "UV-stable WPC boards for exterior walls.",
    image: "/materials/samples/wpc-oak.jpg",
    tags: ["wpc"],
  },
];

// Acoustics (reflector, diffuser, soundproof door)
const ACOUSTICS: CatalogItem[] = [
  {
    slug: "acp-perforated-reflector-silver",
    name: "ACP Perforated Reflector (Silver)",
    description: "Aluminum composite acoustic reflector panel.",
    image: "/materials/samples/acp-perforated-silver.jpg",
    tags: ["reflector", "acp"],
  },
  {
    slug: "wpc-2d-diffuser-oak",
    name: "WPC 2D Diffuser (Oak)",
    description: "2D diffuser slats for better speech clarity.",
    image: "/materials/samples/wpc-oak.jpg",
    tags: ["diffuser", "wpc"],
  },
  {
    slug: "acoustic-soundproof-door-stc35",
    name: "Acoustic Soundproof Door (STC 35–40)",
    description: "Steel acoustic door with perimeter seals.",
    image: "/materials/samples/soundproof-door.jpg",
    tags: ["soundproof-door"],
  },
];

export const CATALOG: CatalogItem[] = [
  ...INTERIOR,
  ...EXTERIOR,
  ...ACOUSTICS,
];

// Helpers
export function getItem(slug: string) {
  return CATALOG.find((i) => i.slug === slug);
}

export function listByAnyTags(tags: MaterialTag[]) {
  if (!tags.length) return CATALOG;
  const set = new Set(tags);
  return CATALOG.filter((i) => i.tags.some((t) => set.has(t)));
}

export function listByDesign(kind: DesignKind) {
  switch (kind) {
    case "interior":
      return INTERIOR;
    case "exterior":
      return EXTERIOR;
    case "acoustics":
      return ACOUSTICS;
  }
}

// For AI Visualizer (same shape, just a friendlier name)
export type MaterialSample = {
  id: string;        // use slug as id
  slug: string;
  name: string;
  sampleImage: string;
  notes?: string;
  tags: MaterialTag[];
};

export const MATERIAL_SAMPLES: MaterialSample[] = CATALOG.map((i) => ({
  id: i.slug,
  slug: i.slug,
  name: i.name,
  sampleImage: i.image,
  notes: i.description,
  tags: i.tags,
}));
