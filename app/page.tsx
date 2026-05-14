import Link from "next/link";
import type { ReactNode } from "react";

/** Helper to center page content when needed */
function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Volt Designs & Acoustics",
            legalName: "Volt Designs & Acoustics",
            url: "https://voltdesigns.co",
            logo: "https://voltdesigns.co/logo.png",
            description:
              "Volt Designs & Acoustics provides ACP, WPC, CNC, acoustic design, noise control, acoustic treatment, and specialist interior finishing solutions in Nigeria.",
            areaServed: "Nigeria",
            sameAs: [],
          }),
        }}
      />

      {/* Full-bleed Hero */}
      <section className="relative overflow-hidden">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-still-1.png"
          preload="metadata"
        >
          <source src="/videos/hero-1080.webm" type="video/webm" />
          <source src="/videos/hero-1080.mp4" type="video/mp4" />
        </video>

        {/* content */}
        <div className="relative z-20 flex min-h-[75vh] items-center justify-start px-4 md:min-h-[80vh] md:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-2xl text-left">
            {/* ⬇️ Small, more transparent glass ONLY around the title */}
            <div className="inline-block rounded-2xl bg-white/2 px-4 py-3 backdrop-blur-md ring-1 ring-black/10">
              <h1 className="text-gold-400 text-3xl font-semibold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] md:text-5xl">
                Innovative Panel & Acoustic Solutions.
              </h1>
            </div>

            <p className="mt-4 text-white/85 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              ACP, WPC, CNC, and professional acoustics — design, supply,
              installation, and noise control.
            </p>

            <div className="mt-6 flex flex-wrap justify-start gap-3">
              <Link href="/ai-design-visualizer" className="btn btn-outline">
                Upload Your Space
              </Link>

              <Link href="/materials" className="btn">
                Material options
              </Link>

              <Link href="/get-a-quote" className="btn btn-gold">
                Request a Quote
              </Link>

              {/* T60 Analysis Button added here */}
              <a href="#t60-analysis" className="btn btn-outline">
                T60 Analysis
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Materials strip */}
      <section className="mt-12">
        <PageContainer>
          <h2 className="text-xl font-semibold">Materials</h2>

          <p className="mt-2 max-w-2xl text-white/70">
            Browse our ACP, WPC, and Acoustic products — each with multiple
            colors and finishes.
          </p>

          {/* 3 top-level groups */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* ACP */}
            <Link
              href="/materials/acp"
              className="card flex flex-col transition hover:border-white/20"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-md">
                <img
                  src="/materials/acp/acp-1.jpg"
                  alt="ACP"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-3">
                <h3 className="font-semibold">ACP</h3>
                <p className="mt-2 text-sm text-white/60">
                  Aluminum composite panels in premium finishes.
                </p>
              </div>
            </Link>

            {/* WPC */}
            <Link
              href="/materials/wpc"
              className="card flex flex-col transition hover:border-white/20"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-md">
                <img
                  src="/materials/wpc/wpc-1.jpg"
                  alt="WPC"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-3">
                <h3 className="font-semibold">WPC</h3>
                <p className="mt-2 text-sm text-white/60">
                  Wood-plastic composite: warm, durable textures.
                </p>
              </div>
            </Link>

            {/* Acoustic */}
            <Link
              href="/materials/acoustic"
              className="card flex flex-col transition hover:border-white/20"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-md">
                <img
                  src="/materials/acoustic/acoustic-1.jpg"
                  alt="Acoustic"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-3">
                <h3 className="font-semibold">Acoustic</h3>
                <p className="mt-2 text-sm text-white/60">
                  Diffusers, reflectors, doors — engineered sound control.
                </p>
              </div>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* Oodio T60 Calculator Iframe Embedded Here */}
      <section id="t60-analysis" className="mt-16 mb-16 pt-8 border-t border-white/10">
        <PageContainer>
          <h2 className="text-xl font-semibold">T60 Acoustic Analysis</h2>
          <p className="mt-2 max-w-2xl text-white/70 mb-6">
            Calculate and optimize your room's reverberation time instantly using our integrated Oodio measurement tool.
          </p>
          
          <div className="w-full overflow-hidden rounded-xl border border-white/20 bg-black/40 h-[750px]">
            <iframe
              src="https://oodio.vercel.app/"
              width="100%"
              height="100%"
              className="border-0"
              title="Oodio T60 Calculator"
              allow="microphone" 
            />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
