// components/DesktopHeader.tsx
"use client";

import Link from "next/link";

type Props = {
  className?: string;
};

function NavPill({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm
                 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

export default function DesktopHeader({ className = "" }: Props) {
  return (
    <nav
      className={`hidden items-center justify-end gap-3 md:flex ${className}`}
    >
      <NavPill href="/products">Products</NavPill>
      <NavPill href="/services">Services</NavPill>
      <NavPill href="/ai-design-visualizer">AI Visualizer</NavPill>
      <NavPill href="/portfolio">Portfolio</NavPill>
      <NavPill href="/about-us">About</NavPill>
      <NavPill href="/blog">Blog</NavPill>
      <NavPill href="/contact">Contact</NavPill>

      {/* Emphasized CTA */}
      <Link
        href="/get-a-quote"
        className="ml-1 inline-flex items-center rounded-xl border border-amber-400/40 bg-amber-500/15
                   px-3.5 py-1.5 text-sm text-amber-100 backdrop-blur transition
                   hover:border-amber-400/60 hover:bg-amber-500/25"
      >
        Get a Quote
      </Link>
    </nav>
  );
}
