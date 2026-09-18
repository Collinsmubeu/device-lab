"use client";

import { useId } from "react";
import Link from "next/link";

export default function Footer() {
  const id = useId().slice(1, 10);

  return (
    <footer className="relative border-t border-border bg-canvas/80 backdrop-blur-sm font-mono">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 items-center gap-4 text-center sm:grid-cols-3 sm:text-left">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
              </span>
              <span className="text-xs text-text-dim">
                {"// STATUS: SYSTEMS_NOMINAL"}
              </span>
            </div>
            <span className="text-xs text-text-dim">
              {"// COORD: 1.2921\u00b0 S, 36.8219\u00b0 E"}
            </span>
            <span className="text-[10px] text-text-dim/60">
              {"// SID: "}
              {id}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-text-dim opacity-70 transition-opacity hover:opacity-100">
            <Link href="/trade-in" className="hover:text-info">Trade-In Flow</Link>
            <span className="text-text-dim/30">|</span>
            <Link href="/#marketplace" className="hover:text-info">Browse Inventory</Link>
            <span className="text-text-dim/30">|</span>
            <Link href="/trade-in" className="hover:text-info">Refurbish Benchmarks</Link>
            <span className="text-text-dim/30">|</span>
            <a href="#marketplace" className="hover:text-info">Support Terminal</a>
          </div>

          <div className="flex flex-col items-center gap-1 sm:items-end">
            <Link
              href="/admin"
              className="group inline-block rounded border border-border bg-card/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-dim transition-all duration-200 hover:border-info hover:text-info hover:shadow-info-glow"
            >
              {"[ ADMINISTRATIVE_PORTAL ]"}
            </Link>
            <span className="text-[10px] text-text-dim/50">
              {"\u00a9 2026 DEVICE LAB 254. ALL RIGHTS RESERVED."}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
