import Link from "next/link";
import { MATERIALS } from "./materials/_data";

export default function Home() {
  return (
    <>
      {/* Hero */}
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
          {/* Make sure these files exist at public/videos/... */}
          <source src="/videos/hero-1080.webm" type="video/webm" />
          <source src="/videos/hero-1080.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay above the video */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Content on top */}
        <div className="relative z-20 container min-h-[78vh] flex items-center">
          <div>
            <h1>Innovative Panel & Acoustic Solutions. Impeccably Executed.</h1>
            <p className="mt-4 text-white/80 max-w-xl">
              ACP, WPC, CNC, and professional acoustics — design, supply, installation, and noise control.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/get-a-quote" className="btn btn-gold">Request a Quote</Link>
              <Link href="/ai-design-visualizer" className="btn btn-outline">Upload Your Space</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="section container mt-12">
        <h2>Materials</h2>
        <p className="text-white/70 mt-2 max-w-2xl">
          Browse our ACP, WPC, and Acoustic products — each with multiple colors and finishes.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {MATERIALS.map((mat) => (
            <Link
              key={mat.slug}
              href={`/materials/${mat.slug}`}
              className="card hover:border-white/20 transition flex flex-col"
            >
              {/* Preview image */}
              <div className="relative w-full h-40 bg-black/20 overflow-hidden rounded-md">
                <img
                  src={mat.images[0]}
                  alt={mat.name}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="mt-3">
                <h3 className="font-semibold">{mat.name}</h3>
                <p className="text-white/60 text-sm mt-2">{mat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
