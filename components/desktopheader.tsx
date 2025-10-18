// components/DesktopHeader.tsx
"use client";

import Link from "next/link";

export default function DesktopHeader() {
  return (
    <div className="hidden md:flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-md">
      <Link href="/" className="text-white font-semibold tracking-wide">
        Volt Designs &amp; Acoustics
      </Link>

      <nav className="flex items-center gap-6 text-sm text-white/90">
        <Link href="/products" className="hover:opacity-80">Products</Link>
        <Link href="/services" className="hover:opacity-80">Services</Link>
        <Link href="/ai-design-visualizer" className="hover:opacity-80">AI Visualizer</Link>
        <Link href="/portfolio" className="hover:opacity-80">Portfolio</Link>
        <Link href="/about" className="hover:opacity-80">About</Link>
        <Link href="/blog" className="hover:opacity-80">Blog</Link>
        <Link href="/contact" className="hover:opacity-80">Contact</Link>
        <Link
          href="/get-a-quote"
          className="rounded-lg border border-amber-400/50 px-3 py-1 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20"
        >
          Get a Quote
        </Link>
      </nav>
    </div>
  );
}
