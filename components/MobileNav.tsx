"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Mail, MessageSquareText } from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // 👉 Update these contact details
  const PHONE_DISPLAY = "+234 800 000 0000";
  const PHONE_TEL = "+2348000000000"; // no spaces for tel:
  const EMAIL = "hello@volt-acoustics.com";
  const WHATSAPP_NUMBER = "2348000000000"; // no + for wa.me links

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden p-2 text-white/80 hover:text-white"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-black/95 border-l border-white/10 z-50 transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header: logo + close */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-white"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Volt Designs & Acoustics"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span>
              Volt <span className="text-gold">Designs</span>
            </span>
          </Link>

          <button
            className="p-2 text-white/70 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-4 p-4 text-sm text-white/80">
          <Link href="/products" onClick={() => setOpen(false)}>Products</Link>
          <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/ai-design-visualizer" onClick={() => setOpen(false)}>AI Visualizer</Link>
          <Link href="/portfolio" onClick={() => setOpen(false)}>Portfolio</Link>
          <Link href="/about-us" onClick={() => setOpen(false)}>About</Link>
          <Link href="/blog" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>

          <Link
            href="/get-a-quote"
            className="btn btn-gold text-center mt-2"
            onClick={() => setOpen(false)}
          >
            Get a Quote
          </Link>
        </nav>

        {/* Contact block pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/90">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-2">
            Contact us
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`tel:${PHONE_TEL}`}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <Phone className="w-4 h-4 text-gold" />
              {PHONE_DISPLAY}
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <Mail className="w-4 h-4 text-gold" />
              {EMAIL}
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <MessageSquareText className="w-4 h-4 text-gold" />
              WhatsApp
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
