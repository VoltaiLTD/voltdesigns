export const metadata = {
  title: "Portfolio — Volt Designs & Acoustics",
  description: "Our completed projects: ACP, WPC, CNC, and acoustic solutions.",
};

const PROJECTS = [
  {
    slug: "lagos-office-facade",
    title: "Commercial Office ACP Façade",
    category: "Exterior",
    image: "/products/house-perforated-acp-1.png",
  },
  {
    slug: "residential-livingroom-wpc",
    title: "Residential Living Room with WPC",
    category: "Interior",
    image: "/products/house-mix-wpc-acp-1.png",
  },
  {
    slug: "studio-diffuser-design",
    title: "Professional Recording Studio Diffuser Layout",
    category: "Acoustic",
    image: "/products/acoustic-diffuser-close.png",
  },
];

export default function PortfolioPage() {
  return (
    <section className="section container">
      <h1>Our Portfolio</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        A selection of ACP façades, WPC interiors, CNC features and acoustic installations we’ve delivered.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {PROJECTS.map((p) => (
          <a
            key={p.slug}
            href={`/portfolio/${p.slug}`}
            className="card group overflow-hidden"
          >
            <div className="aspect-video w-full rounded-xl overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="object-cover w-full h-full group-hover:scale-105 transition"
              />
            </div>
            <h3 className="font-semibold mt-3">{p.title}</h3>
            <p className="text-xs text-white/50">{p.category}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
