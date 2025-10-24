// components/MobileNav.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // --- Close on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // --- Simple swipe-to-close (drag right ≥ 60px)
  const panelRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
    // translate capsule a little for affordance
    const el = panelRef.current;
    if (el) {
      const x = Math.max(0, Math.min(60, deltaX.current));
      el.style.transform = `translateX(${x}px)`;
    }
  }
  function onTouchEnd() {
    const el = panelRef.current;
    if (el) el.style.transform = "";
    if (deltaX.current >= 60) setOpen(false);
    startX.current = null;
    deltaX.current = 0;
  }

  // shared styles
  const itemClass =
    "block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-base";

  const closeAnd = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
      >
        {/* hamburger */}
        <span className="sr-only">Menu</span>
        <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90">
          <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop (tap to close) */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Capsule panel */}
          <div
            ref={panelRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="absolute top-3 left-3 right-3 rounded-2xl border border-white/10
                       bg-neutral-900/90 backdrop-blur p-3 shadow-2xl"
          >
            {/* Header row with title + close */}
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="text-sm/6 text-white/70">Menu</div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71L12 12.01l-6.3-6.3L4.29 7.1l6.3 6.3l-6.3 6.3l1.41 1.41l6.3-6.3l6.3 6.3l1.41-1.41l-6.3-6.3l6.3-6.3z"
                  />
                </svg>
              </button>
            </div>

            <div className="grid gap-2 mt-1">
              <Link href="/products" onClick={closeAnd()} className={itemClass}>
                Products
              </Link>
              <Link href="/services" onClick={closeAnd()} className={itemClass}>
                Services
              </Link>
              <Link
                href="/ai-design-visualizer"
                onClick={closeAnd()}
                className={itemClass}
              >
                AI Visualizer
              </Link>
              <Link href="/portfolio" onClick={closeAnd()} className={itemClass}>
                Portfolio
              </Link>
              <Link href="/about-us" onClick={closeAnd()} className={itemClass}>
                About
              </Link>
              <Link href="/blog" onClick={closeAnd()} className={itemClass}>
                Blog
              </Link>
              <Link href="/contact" onClick={closeAnd()} className={itemClass}>
                Contact
              </Link>

              {/* CTA */}
              <Link
                href="/get-a-quote"
                onClick={closeAnd()}
                className="block w-full text-center px-4 py-3 rounded-xl
                           bg-amber-500/15 text-amber-100 border border-amber-400/40
                           hover:bg-amber-500/25"
              >
                Get a Quote
              </Link>
            </div>

            {/* Swipe hint */}
            <div className="mt-3 text-center text-[11px] text-white/50">
              Swipe right, tap outside, or press Esc to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
