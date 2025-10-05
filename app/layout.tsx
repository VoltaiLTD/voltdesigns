import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";

export const metadata = {
  title: "Volt Designs & Acoustics — ACP, WPC & Acoustic Solutions",
  description:
    "Premium ACP, WPC, CNC, and acoustic solutions: design, supply, installation, and noise control.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Global dark theme + vertical layout so footer sits at the bottom */}
      <body className="min-h-screen bg-black text-white antialiased flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 supports-backdrop-blur:bg-black/50 bg-black/80 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6 flex items-center justify-between py-3">
            {/* Brand / Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold group">
              <Image
                src="/logo.png"
                alt="Volt Designs & Acoustics"
                width={36}
                height={36}
                className="rounded-md"
                priority
              />
              <span className="inline-flex items-baseline gap-1">
                <span>Volt</span>
                <span className="text-gold group-hover:opacity-90 transition">Designs</span>
                <span>&amp; Acoustics</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5 text-sm">
              <Link href="/products">Products</Link>
              <Link href="/services">Services</Link>
              <Link href="/ai-design-visualizer">AI Visualizer</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/about-us">About</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/get-a-quote" className="btn btn-gold text-sm">
                Get a Quote
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <MobileNav />
          </div>
        </header>

        {/* Main content (children decide their own width).
           For most pages we center content using the helper wrapper below. */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-8 text-sm text-white/70">
            © {new Date().getFullYear()} Volt Designs & Acoustics. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
