import { notFound } from "next/navigation";

const PROJECTS = [
  {
    slug: "lagos-office-facade",
    title: "Commercial Office ACP Façade",
    category: "Exterior",
    image: "/products/house-perforated-acp-1.png",
    description: `
      <p>This landmark office building in Lagos features a fully ventilated 
      ACP façade with CNC perforations. The system ensures durability, 
      modern aesthetics, and improved thermal comfort.</p>
    `,
  },
  {
    slug: "residential-livingroom-wpc",
    title: "Residential Living Room with WPC",
    category: "Interior",
    image: "/products/house-mix-wpc-acp-1.png",
    description: `
      <p>A warm and sustainable WPC wall cladding, installed in a 
      high-end Lagos residence. Provides acoustic absorption and 
      a natural wood aesthetic with zero termite issues.</p>
    `,
  },
  {
    slug: "studio-diffuser-design",
    title: "Professional Recording Studio Diffuser Layout",
    category: "Acoustic",
    image: "/products/acoustic-diffuser-close.png",
    description: `
      <p>We designed and installed quadratic diffusers to improve clarity, 
      balance, and spatial imaging in this studio space. Combined with 
      absorbers, it achieves a controlled yet lively sound.</p>
    `,
  },
];

export default function PortfolioDetail({ params }: { params: { slug: string } }) {
  const project = PROJECTS.find((p) => p.slug === params.slug);
  if (!project) return notFound();

  return (
    <article className="section container">
      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
        <img
          src={project.image}
          alt={project.title}
          className="object-cover w-full h-full"
        />
      </div>
      <h1 className="mt-4">{project.title}</h1>
      <p className="text-sm text-white/50">{project.category}</p>
      <div
        className="prose prose-invert mt-4"
        dangerouslySetInnerHTML={{ __html: project.description }}
      />
    </article>
  );
}
