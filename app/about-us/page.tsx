export default function AboutUsPage() {
  return (
    <section className="section container">
      <h1>About Volt Designs & Acoustics</h1>
      <p className="text-white/70 mt-3 max-w-3xl">
        We design and deliver premium façade, interior and acoustic solutions across residential, commercial and hospitality projects.
        Our team blends architectural detailing with engineering discipline to produce spaces that are beautiful, durable and
        acoustically comfortable.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="font-semibold">What we do</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80 text-sm">
            <li>Exterior & interior concepts, material palettes and 3D previews</li>
            <li>Sales & installation of ACP/WPC cladding systems</li>
            <li>CNC designs & perforation for feature walls, ceilings and screens</li>
            <li>Acoustic evaluation, design & installation (diffusers, absorbers, reflectors)</li>
            <li>Soundproofing of studios, offices, homes and worship spaces</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="font-semibold">Why clients choose us</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80 text-sm">
            <li>Detailed drawings and clear budgets before we build</li>
            <li>Premium materials with warranties and after-sales support</li>
            <li>Precise installation tolerances and waterproofing details</li>
            <li>On-time delivery, safety compliance and site QA</li>
          </ul>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold">Contact</h3>
        <p className="text-white/80 text-sm mt-2">
          Email: <a href="mailto:voltai.ltd@hotmail.com" className="underline">voltai.ltd@hotmail.com</a> ·
          Phone/WhatsApp: <a href="tel:+2347963859211" className="underline">+234 706 385 9211</a>
        </p>
      </div>
    </section>
  );
}
