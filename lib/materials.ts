// lib/materials.ts
export type Material = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  specs: Record<string, string | number>;
  catalogueUrl?: string; // link to your PDF if available
};

export const MATERIALS: Material[] = [
  {
    slug: "acp-perforated-reflector",
    name: "ACP Perforated Reflector",
    description: "Aluminum composite panel with tuned perforation for acoustic reflectors.",
    image: "/products/acp-perforated-reflector.png",
    specs: {
      Thickness: "4 mm",
      Core: "PE / FR options",
      Finish: "PVDF",
      "Sheet Size": "1220 × 2440 mm",
      Weight: "5.6 kg/m²",
      NRC: "0.35 (with backing)",
    },
    catalogueUrl: "/catalogues/acp-perforated-reflector.pdf",
  },
  {
    slug: "wpc-wall-cladding",
    name: "WPC Wall Cladding",
    description: "Wood-plastic composite cladding for warm acoustic diffusion.",
    image: "/products/wpc-wall-cladding.png",
    specs: {
      Profile: "156 × 21 mm",
      Material: "Wood fiber + HDPE",
      "Coverage / board": "0.156 m²",
      "Board Length": "2.9 m",
      "Fire Class": "B-s2,d0 (typical)",
    },
    catalogueUrl: "/catalogues/wpc-wall-cladding.pdf",
  },
];

export function getMaterial(slug: string) {
  return MATERIALS.find((m) => m.slug === slug);
}
