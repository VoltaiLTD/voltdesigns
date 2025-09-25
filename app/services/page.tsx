// app/services/page.tsx
import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "./_data";

export const metadata = {
  title: "Services — Volt Designs & Acoustics",
  description:
    "ACP, WPC, CNC, acoustics, soundproofing, and fire-rating services for residential, commercial, and hospitality spaces.",
};

export default function ServicesPage() {
  return (
    <section className="section container">
      <h1>Our Services</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        Design, supply, installation, acoustics, CNC, and certified fire-rating —
        delivered with precision and care.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {SERVICES.map((svc) => {
          const Icon = svc.icon;
          return (
            <Link
              key={svc.slug}
              href={`/services/${svc.slug}`}
              className="card hover:border-white/20 transition flex flex-col"
            >
              {/* Hero preview (if available) */}
              <div className="relative w-full h-40 overflow-hidden rounded-md bg-black/20">
                {svc.hero ? (
                  <Image
                    src={svc.hero}
                    alt={svc.title ?? svc.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="p-2 rounded-md border border-white/10 bg-black/30">
                  {Icon && <Icon className="w-5 h-5 text-[color:var(--gold,#D4AF37)]" />}
                </div>
                <h3 className="font-semibold">{svc.name}</h3>
              </div>
              <p className="text-white/60 text-sm mt-2">{svc.description}</p>

              <div className="mt-3 text-[color:var(--gold,#D4AF37)] text-sm">
                View details →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
