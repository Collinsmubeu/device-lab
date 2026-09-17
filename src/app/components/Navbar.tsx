"use client";

import { useEffect, useState } from "react";
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
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left Zone: Logo & Subtitle */}
        <div className="flex flex-col">
          <span className="text-xs tracking-[0.3em] text-text">
            D V C L B // 254
          </span>
          <span className="text-[9px] text-text-dim">
            Nairobi_HQ // Hardware.Archive
          </span>
        </div>

        {/* Center Zone: Nav Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#marketplace"
            className="text-text-dim transition-colors hover:text-neon"
          >
            [ 01_MARKETPLACE ]
          </Link>
          <Link
            href="/trade-in"
            className="text-text-dim transition-colors hover:text-neon"
          >
            [ 02_TRADE_IN ]
          </Link>
          <Link
            href="#services"
            className="text-text-dim transition-colors hover:text-neon"
          >
            [ 03_SERVICES ]
          </Link>
        </div>

        {/* Right Zone: Auth + Live Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/signin?mode=register"
            className="rounded border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-dim transition-colors hover:border-neon hover:text-neon"
          >
            [ SECURE_ACCOUNT // SIGN_UP ]
          </Link>
          <Link
            href="/signin"
            className="rounded border border-neon bg-neon/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neon transition-colors hover:bg-neon/20"
          >
            [ AUTHENTICATE // LOGIN ]
          </Link>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-info"></span>
          </span>
          <span className="hidden text-xs text-text-dim lg:inline">
            LIVE_INTAKE_OPEN
          </span>
        </div>
      </div>
    </nav>
  );
}