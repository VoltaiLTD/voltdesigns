// app/services/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "../_data";

type Svc = (typeof SERVICES)[number];

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const svc = SERVICES.find((s) => s.slug === params.slug);
  const title = svc?.title ?? svc?.name ?? "Service";
  const desc =
    svc?.teaser ?? svc?.summary ?? svc?.description ?? "Service details";
  return {
    title: `${title} — Volt Designs & Acoustics`,
    description: desc,
  };
}

export default function ServiceDetail({
  params,
}: {
  params: { slug: string };
}) {
  const svc = SERVICES.find((s) => s.slug === params.slug) as
    | (Svc & {
        title?: string;
        hero?: string;
        teaser?: string;
        summary?: string;
        bullets?: string[];
        pricing?: { name: string; price: string; features?: string[] }[];
        cta?: {
          primaryText?: string;
          primaryHref?: string;
          secondaryText?: string;
          secondaryHref?: string;
        };
      })
    | undefined;

  if (!svc) return notFound();

  const Icon = svc.icon;
  const title = svc.title ?? svc.name;
  const summary = svc.summary ?? svc.description;
  const bullets = svc.bullets ?? [];
  const primaryText = svc.cta?.primaryText ?? "Request a Quote";
  const primaryHref = svc.cta?.primaryHref ?? "/get-a-quote";

  return (
    <>
      {/* Hero (with safe fallback) */}
      <section className="relative h-[36vh] min-h-[300px]">
        {svc.hero ? (
          <>
            <Image
              src={svc.hero}
              alt={title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
        )}
        <div className="absolute inset-0 container flex items-end pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border border-white/10 bg-black/40">
              {Icon && (
                <Icon className="w-7 h-7 text-[color:var(--gold,#D4AF37)]" />
              )}
            </div>
            <h1>{title}</h1>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="section container grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {summary && (
            <div className="card">
              <p className="text-white/80 whitespace-pre-line">{summary}</p>
            </div>
          )}

          {bullets.length > 0 && (
            <div className="card mt-4">
              <h3 className="font-semibold">What’s Included</h3>
              <ul className="mt-3 list-disc pl-5 space-y-1 text-white/80">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Simple inline pricing table (no external component needed) */}
          {svc.pricing && (
            <div className="card mt-4">
              <h3 className="font-semibold mb-3">Pricing</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {svc.pricing.map((plan) => (
                  <div key={plan.name} className="rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <div className="text-[color:var(--gold,#D4AF37)] font-semibold">
                        {plan.price}
                      </div>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-3 list-disc pl-5 text-white/70 text-sm space-y-1">
                        {plan.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="card">
            <h3 className="font-semibold">Get Started</h3>
            <p className="text-white/70 text-sm mt-1">
              Tell us about your space and goals. We’ll suggest materials,
              budgets and timelines.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href={primaryHref} className="btn btn-gold w-full">
                {primaryText}
              </Link>
              {/* Add a secondary CTA if needed via svc.cta */}
            </div>
          </div>

          {/* Minimal contact mini form substitute */}
          <div className="card">
            <h3 className="font-semibold">Quick Contact</h3>
            <p className="text-white/70 text-sm mt-1">
              Prefer WhatsApp or email? We’ll get right back.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <a href="mailto:voltai.ltd@hotmail.com" className="text-white/80 underline">
                voltai.ltd@hotmail.com
              </a>
              <div className="text-white/80">+234 706 385 9211</div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
