"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GOLD = "text-amber-300";
const GOLD_BG = "bg-amber-400/20 border-amber-300/40";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => setOpen(false), [pathname]);

  // Lock background scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Swipe-to-close
  const startX = useRef<number | null>(null);
  const translateX = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    translateX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    // Only allow swiping right-to-left to close (negative dx)
    const t = Math.min(0, dx);
    translateX.current = t;
    if (panelRef.current) {
      panelRef.current.style.transform = `translateX(${t}px)`;
    }
    if (backdropRef.current) {
      const opacity = Math.max(0, Math.min(1, 0.6 + t / 300)); // fade as it moves
      backdropRef.current.style.backgroundColor = `rgba(0,0,0,${opacity})`;
    }
  }
  function onTouchEnd() {
    if (startX.current == null) return;
    // If swiped left by at least 60px, close
    if (translateX.current < -60) {
      setOpen(false);
    } else {
      // Snap back
      if (panelRef.current) panelRef.current.style.transform = "";
      if (backdropRef.current) backdropRef.current.style.backgroundColor = "";
    }
    startX.current = null;
    translateX.current = 0;
  }

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/materials", label: "Materials" },
    { href: "/ai-design-visualizer", label: "AI Visualizer" },
    { href: "/get-a-quote", label: "Get a Quote" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b0d]/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg border border-amber-300/40 bg-amber-400/10" />
          <span className={`text-sm font-semibold ${GOLD}`}>Volt Designs & Acoustics</span>
        </Link>

        {/* Desktop nav (hidden on small) */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/85">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className={`md:hidden rounded-lg px-3 py-1 border ${GOLD_BG} text-white`}
        >
          Menu
        </button>
      </div>

      {/* Mobile slide-over */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            ref={backdropRef}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="fixed right-0 top-0 z-50 h-full w-[82%] max-w-sm md:hidden
                       bg-[#0e0e12] text-white border-l border-white/10
                       shadow-2xl transition-transform duration-200 will-change-transform"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
          >
            {/* Header row with retract arrow */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className={`text-sm font-semibold ${GOLD}`}>Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className={`rounded-lg px-2 py-1 border ${GOLD_BG}`}
              >
                ←
              </button>
            </div>

            {/* Links */}
            <nav className="p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)} // retract on select
                  className="block px-4 py-3 rounded-xl border border-white/10 hover:border-amber-300/40 hover:bg-amber-400/10 mb-2"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Footer / extras */}
            <div className="mt-auto p-4 text-xs text-white/60">
              Swipe left to close • Tap arrow to retract
            </div>
          </div>
        </>
      )}
    </header>
  );
}
