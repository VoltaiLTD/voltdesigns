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
    slug: "acoustics",
    name: "Acoustic Materials",
    description: "Diffusers, absorbers, reflectors and soundproofing panels.",
    images: [
      "/materials/acoustics/acoustic-1.jpg",
      "/materials/acoustics/acoustic-2.jpg",
      "/materials/acoustics/acoustic-3.jpg",
      "/materials/acoustics/acoustic-4.jpg",
      "/materials/acoustics/acoustic-5.jpg",
      "/materials/acoustics/acoustic-6.jpg",
      "/materials/acoustics/acoustic-7.jpg",
      "/materials/acoustics/acoustic-8.jpg",
    ],
  },
];
