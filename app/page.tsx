import Link from "next/link";

/** Helper to center page content when needed */
function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>;
}

export default function HomePage() {
  return (
    <>
      {/* Full-bleed Hero */}
      <section className="relative overflow-hidden">
        <video
          className="absolute inset-0 z-0 w-full h-full object-cover"
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

        {/* gradient veil */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        {/* content */}
        <PageContainer>
          <div className="relative z-20 min-h-[72vh] flex items-center">
            <div className="glass p-6 md:p-8 rounded-2xl max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-semibold">
                Innovative Panel & Acoustic Solutions. Impeccably Executed.
              </h1>
              <p className="mt-4 text-white/80">
                ACP, WPC, CNC, and professional acoustics — design, supply, installation, and noise control.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/ai-design-visualizer" className="btn btn-outline">
                  Upload Your Space
                </Link>
                <Link href="/materials" className="btn">
                  Material options
                </Link>
                <Link href="/get-a-quote" className="btn btn-gold">
                  Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Materials strip */}
      <section className="mt-12">
        <PageContainer>
          <h2 className="text-xl font-semibold">Materials</h2>
          <p className="text-white/70 mt-2 max-w-2xl">
            Browse our ACP, WPC, and Acoustic products — each with multiple colors and finishes.
          </p>

          {/* 3 top-level groups */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* ACP */}
            <Link href="/materials/acp" className="card hover:border-white/20 transition flex flex-col">
              <div className="relative w-full h-40 overflow-hidden rounded-md">
                <img
                  src="/materials/acp/acp-1.jpg"
                  alt="ACP"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-3">
                <h3 className="font-semibold">ACP</h3>
                <p className="text-white/60 text-sm mt-2">Aluminum composite panels in premium finishes.</p>
              </div>
            </Link>

            {/* WPC */}
            <Link href="/materials/wpc" className="card hover:border-white/20 transition flex flex-col">
              <div className="relative w-full h-40 overflow-hidden rounded-md">
                <img
                  src="/materials/wpc/wpc-1.jpg"
                  alt="WPC"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-3">
                <h3 className="font-semibold">WPC</h3>
                <p className="text-white/60 text-sm mt-2">Wood-plastic composite: warm, durable textures.</p>
              </div>
            </Link>

            {/* Acoustic — ✅ images linked */}
            <Link href="/materials/acoustic" className="card hover:border-white/20 transition flex flex-col">
              <div className="relative w-full h-40 overflow-hidden rounded-md">
                <img
                  src="/materials/acoustic/acoustic-1.jpg"
                  alt="Acoustic"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-3">
                <h3 className="font-semibold">Acoustic</h3>
                <p className="text-white/60 text-sm mt-2">
                  Diffusers, reflectors, doors — engineered sound control.
                </p>
              </div>
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
