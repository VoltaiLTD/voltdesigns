// app/materials/_data.ts

export type Material = {
  slug: "acp" | "wpc" | "acoustic" | string;
  name: string;
  description: string;
  images: string[]; // up to 8 image paths under /public
};

export const MATERIALS: Material[] = [
  {
    slug: "acp",
    name: "ACP Panels",
    description: "Durable exterior aluminum composite panels with modern finishes.",
    images: [
      "/materials/acp/acp-1.jpg",
      "/materials/acp/acp-2.jpg",
      "/materials/acp/acp-3.jpg",
      "/materials/acp/acp-4.jpg",
      "/materials/acp/acp-5.jpg",
      "/materials/acp/acp-6.jpg",
      "/materials/acp/acp-7.jpg",
      "/materials/acp/acp-8.jpg",
    ],
  },
  {
    slug: "wpc",
    name: "WPC Panels",
    description: "Wood-plastic composites for walls and ceilings with natural textures.",
    images: [
      "/materials/wpc/wpc-1.jpg",
      "/materials/wpc/wpc-2.jpg",
      "/materials/wpc/wpc-3.jpg",
      "/materials/wpc/wpc-4.jpg",
      "/materials/wpc/wpc-5.jpg",
      "/materials/wpc/wpc-6.jpg",
      "/materials/wpc/wpc-7.jpg",
      "/materials/wpc/wpc-8.jpg",
    ],
  },
  {
    slug: "acoustic",
    name: "Acoustic Materials",
    description: "Diffusers, absorbers, reflectors and soundproofing panels.",
    images: [
      "/materials/acoustic/acoustic-1.jpg",
      "/materials/acoustic/acoustic-2.jpg",
      "/materials/acoustic/acoustic-3.jpg",
      "/materials/acoustic/acoustic-4.jpg",
      "/materials/acoustic/acoustic-5.jpg",
      "/materials/acoustic/acoustic-6.jpg",
      "/materials/acoustic/acoustic-7.jpg",
      "/materials/acoustic/acoustic-8.jpg",
    ],
  },
];
