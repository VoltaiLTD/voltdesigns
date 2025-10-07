// app/services/_data.ts
import {
  Home,
  Ruler,
  VolumeX,
  Waves,
  Sparkles,
  PanelRight,
} from "lucide-react";

export type PricingPlan = {
  name: string;
  price: string;
  features?: string[];
};

export type ServiceCTA = {
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
};

export type Service = {
  slug: string;
  name: string;                 // Short label for cards & fallbacks
  description: string;          // Short description for cards
  icon: any;                    // Lucide icon component

  // Optional fields for the detail page:
  title?: string;               // Display title (falls back to name)
  hero?: string;                // /public/... image path for header
  teaser?: string;              // Short meta/SEO
  summary?: string;             // Longer intro (falls back to description)
  bullets?: string[];           // “What’s Included”
  pricing?: PricingPlan[];      // Optional pricing table
  cta?: ServiceCTA;             // Optional CTAs
};

export const SERVICES: Service[] = [
  {
    slug: "interior-exterior-design",
    name: "Exterior & Interior Design",
    description:
      "Custom concepts and finishes for residential, commercial, and hospitality spaces.",
    icon: Home,
    title: "Exterior & Interior Design",
    hero: "/services/interior-exterior-hero.jpg",
    bullets: [
      "Concept development & mood boards",
      "Material & color specification (ACP/WPC/Acoustic)",
      "Detail drawings & site supervision",
    ],
  },
  {
    slug: "architectural-designs-3d",
    name: "Architectural Designs & 3D Renders",
    description:
      "Precision drawings and photorealistic 3D visuals to communicate your vision.",
    icon: Ruler,
    title: "Architectural Designs & 3D Renders",
    hero: "/services/architectural-3d-hero.jpg",
    bullets: [
      "Plans, elevations & sections",
      "Photoreal 3D renders & walkthroughs",
      "Permit-ready documentation",
    ],
  },
  {
    slug: "soundproofing",
    name: "Soundproofing",
    description:
      "Noise isolation assemblies for studios, offices, and worship spaces.",
    icon: VolumeX,
    title: "Soundproofing",
    hero: "/services/soundproofing-hero.jpg",
    bullets: [
      "Walls/ceilings/floors isolation",
      "Doors, seals & gaskets",
      "STC/NC targets & commissioning",
    ],
  },
  {
    slug: "acoustic-evaluation",
    name: "Acoustic Evaluation, Design & Installation",
    description:
      "Professional room analysis and tuned treatment layouts for clarity and control.",
    icon: Waves,
    title: "Acoustic Evaluation, Design & Installation",
    hero: "/services/acoustic-design-hero.jpg",
    bullets: [
      "Site measurement & RT60 assessment",
      "Diffusers, absorbers & reflectors layout",
      "Calibrated tuning & report",
    ],
  },
  {
    slug: "sales-acp-wpc",
    name: "Sales of ACP & WPC Panels",
    description:
      "High-quality panels in multiple textures, colors, and finishes.",
    icon: Sparkles,
    title: "Sales of ACP & WPC Panels",
    hero: "/services/sales-acp-wpc-hero.jpg",
  },
  {
    slug: "installation-acp-wpc",
    name: "Installation of ACP & WPC Panels",
    description:
      "Seamless installation with durable substructures and clean detailing.",
    icon: PanelRight,
    title: "Installation of ACP & WPC Panels",
    hero: "/services/installation-hero.jpg",
    bullets: [
      "Aluminum sub-frames & waterproofing",
      "CNC/perforated panel mounting",
      "Warranty-backed installation",
    ],
  },
  {
    slug: "cnc-designs",
    name: "CNC Designs & Perforation",
    description:
      "Intricate perforations and custom patterns for facades and features.",
    icon: Sparkles,
    title: "CNC Designs & Perforation",
    hero: "/services/cnc-hero.jpg",
    bullets: [
      "Custom perforation patterns",
      "Accurate nesting & finishing",
      "Facade screening & feature walls",
    ],
  },
  {
    slug: "fire-rating",
    name: "Fire Rating Services",
    description:
      "We fire-rate fabrics, leathers, and wooden surfaces to international standards.",
    icon: Sparkles,
    title: "Fire Rating Services",
    hero: "/services/fire-rating-hero.jpg", // optional image in /public/services/
    summary:
      "On-site application of fire-retardant treatments for fabrics, leather, and wood. "
      + "We preserve aesthetics while reducing flammability, and we issue a certification report.",
    bullets: [
      "Surfaces: fabric, leather, wood & composites",
      "Standards: NFPA 701 (USA), BS 476 Part 6 & 7 (UK), EN 13501-1 (EU)",
      "On-site application & certification report",
      "Aftercare guidance and maintenance schedule",
    ],
    pricing: [
      {
        name: "Standard Fire-Rating Treatment",
        price: "₦18,000 / m²",
        features: [
          "Single-pass or multi-pass as required",
          "Certificate of conformity",
          "Site protection & cleanup",
        ],
      },
    ],
    cta: {
      primaryText: "Get Fire-Rating Quote",
      primaryHref: "/get-a-quote?service=fire-rating",
    },
  },
];
