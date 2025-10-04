"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="md:hidden">
      {/* Toggle button (hamburger) */}
      <button
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border px-3 py-2"
      >
        ☰
      </button>

      {/* Off-canvas menu */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <button
            aria-label="Close menu backdrop"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-72 bg-white text-gray-900 shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-md border px-3 py-1"
              >
                Close
              </button>
            </div>

            <nav className="p-4 space-y-3">
              <Link href="/" className="block" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/materials" className="block" onClick={() => setOpen(false)}>Material options</Link>
              <Link href="/ai-design-visualizer" className="block" onClick={() => setOpen(false)}>AI Visualizer</Link>
              <Link href="/get-a-quote" className="block" onClick={() => setOpen(false)}>Get a Quote</Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
