// components/MobileHeader.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };
const NAV: NavItem[] = [
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/ai-design-visualizer", label: "AI Visualizer" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/get-a-quote", label: "Get a Quote" },
  { href: "/materials", label: "Material options" },
];

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    const { body } = document;
    if (open) {
      const prev = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close when route changes
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Click outside to close
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only when the click is on the backdrop (not the sheet)
    if (e.target === e.currentTarget) setOpen(false);
  };

  // Swipe-to-close (right-swipe)
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dx > 60) {
      setOpen(false);
      touchStartX.current = null;
    }
  };

  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md">
        <Link href="/" className="text-white font-semibold tracking-wide">
          Volt Designs &amp; Acoustics
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/90 hover:bg-white/10"
        >
          Menu
        </button>
      </div>

      {/* Backdrop + Sliding Sheet */}
      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md"
          onClick={onBackdropClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          aria-modal="true"
          role="dialog"
        >
          <div
            ref={sheetRef}
            className="absolute inset-y-0 right-0 w-[88%] max-w-sm bg-neutral-950/95 text-white shadow-2xl border-l border-white/10
                       animate-slide-in"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={close}
                  aria-label="Close menu"
                  className="rounded-full border border-white/20 p-2 hover:bg-white/10"
                >
                  {/* Left arrow */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="text-sm opacity-80">Close</span>
              </div>
              <button
                onClick={close}
                className="rounded-lg border border-white/20 px-2 py-1 text-sm hover:bg-white/10"
              >
                ×
              </button>
            </div>

            {/* Nav list */}
            <nav className="px-4 py-3">
              <ul className="space-y-2">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="block rounded-xl px-3 py-3 text-base hover:bg-white/10 active:bg-white/20"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Spacer so the top bar doesn't cover content */}
      <div className="h-[56px]" />
    </div>
  );
}

/* Tailwind helper (in globals.css):
@keyframes slide-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0%); }
}
.animate-slide-in { animation: slide-in 180ms ease-out both; }
*/
