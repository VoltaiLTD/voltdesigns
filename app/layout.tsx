// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

// Mobile drawer / hamburger
import MobileNav from "@/components/MobileNav";

// Desktop navigation (make sure the file is exactly components/DesktopHeader.tsx)
import DesktopHeader from "@/components/desktopheader";

export const metadata = {
  title: "Volt Designs & Acoustics — ACP, WPC & Acoustic Solutions",
  description:
    "Premium ACP, WPC, CNC, and acoustic solutions: design, supply, installation, and noise control.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-900 text-white antialiased flex flex-col">
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
                <span className="text-yellow-400">Volt</span>
                <span className="text-white-400 group-hover:opacity-90 transition">Designs</span>
                <span className="text-white-400">&amp; Acoustics</span>
              </span>
            </Link>

            {/* Right side: Desktop nav OR Mobile hamburger */}
            <div className="flex items-center">
              {/* Desktop nav */}
              <div className="hidden md:block">
                <DesktopHeader />
              </div>
              {/* Mobile hamburger / drawer trigger */}
              <div className="md:hidden">
                <MobileNav />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
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
