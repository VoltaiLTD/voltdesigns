"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** tiny inline icons (no extra deps) */
const IconMenu = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
    <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
  </svg>
);
const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
    <path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.7 2.88 18.3 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z" />
  </svg>
);
const IconBack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
    <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Prevent body scroll when the menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original || "";
    return () => {
      document.body.style.overflow = original || "";
    };
  }, [open]);

  // Swipe-to-close (swipe right)
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    if (start == null) return;
    const end = e.changedTouches[0].clientX;
    if (end - start > 60) setOpen(false); // swipe right closes
    touchStartX.current = null;
  }

  return (
    <>
      {/* Trigger button (only visible on mobile) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:text-white hover:bg-white/10"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>

      {/* Off-canvas wrapper + backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition pointer-events-none ${
          open ? "pointer-events-auto" : ""
        }`}
        aria-hidden={!open}
      >
        {/* Translucent, blurring backdrop that closes on click */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Slide-in panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-72 max-w-[85%] bg-black/85 border-l border-white/10 text-white
                      transition-transform duration-300 ease-out
                      ${open ? "translate-x-0" : "translate-x-full"}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-white/90 hover:text-white"
              aria-label="Close menu"
            >
              <IconBack />
              <span className="text-sm">Close</span>
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex p-1 rounded hover:bg-white/10"
              aria-label="Close menu"
            >
              <IconX />
            </button>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-2">
            <Link href="/products" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              Products
            </Link>
            <Link href="/services" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              Services
            </Link>
            <Link href="/ai-design-visualizer" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              AI Visualizer
            </Link>
            <Link href="/portfolio" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              Portfolio
            </Link>
            <Link href="/about-us" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              About
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              Blog
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-white/10">
              Contact
            </Link>

            <Link
              href="/get-a-quote"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-yellow-500/60 bg-yellow-500/20 px-3 py-2 text-yellow-200 hover:bg-yellow-500/30"
            >
              Get a Quote
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
