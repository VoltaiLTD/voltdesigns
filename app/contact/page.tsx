import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <section className="section container">
      <h1>Contact Us</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        Have a project in mind? We’d love to help with design, materials, installation and acoustics.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="card space-y-2">
          <h3 className="font-semibold">Reach us</h3>
          <p>Email: <a className="underline" href="mailto:voltai.ltd@hotmail.com">voltai.ltd@hotmail.com</a></p>
          <p>Phone/WhatsApp: <a className="underline" href="tel:+2347063859211">+234 706 385 9211</a></p>
          <p className="text-sm text-white/70">Office/Showroom: Lekki County Homes, Ikota, Lagos, Nigeria</p>
          <p className="text-sm text-white/70">Mon–Sat, 9:00–18:00 WAT</p>
        </div>
        <div className="card md:col-span-2">
          <iframe
            title="Volt Designs & Acoustics Location"
            width="100%"
            height="100%"
            className="aspect-video w-full rounded-xl overflow-hidden border border-white/10"
            src="https://www.google.com/maps?q=lekkicountyhomesikota,+Lagos&output=embed"
          />
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold">Send us a message</h3>
        <ContactForm /> {/* 👈 insert the client component */}
      </div>
    </section>
  );
}
