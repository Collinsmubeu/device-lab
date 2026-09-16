"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b font-mono text-xs transition-all duration-300 ${
        scrolled
          ? "border-border bg-canvas/80 backdrop-blur"
          : "border-transparent bg-canvas"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* ── Left Zone: Logo & Subtitle ── */}
        <div className="flex flex-col">
          <span className="text-xs tracking-[0.3em] text-text">
            D V C L B // 254
          </span>
          <span className="text-[9px] text-text-dim">
            Nairobi_HQ // Hardware.Archive
          </span>
        </div>

        {/* ── Center Zone: Nav Links ── */}
        <div className="flex items-center gap-6">
          <Link
            href="#marketplace"
            className="text-text-dim transition-colors hover:text-neon"
          >
            [ 01_MARKETPLACE ]
          </Link>
          <Link
            href="#cash-out"
            className="text-text-dim transition-colors hover:text-neon"
          >
            [ 02_CASH_OUT ]
          </Link>
          <Link
            href="#services"
            className="text-text-dim transition-colors hover:text-neon"
          >
            [ 03_SERVICES ]
          </Link>
        </div>

        {/* ── Right Zone: Live Status Badge ── */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon"></span>
          </span>
          <span className="text-xs text-text-dim">LIVE_INTAKE_OPEN</span>
        </div>
      </div>
    </nav>
  );
}
