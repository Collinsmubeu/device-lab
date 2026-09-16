"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden font-mono">
      {/* Technical geometric grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, theme(colors.border) 1px, transparent 1px),
            linear-gradient(to bottom, theme(colors.border) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          opacity: 0.15,
        }}
      />

      {/* Radial mask fading toward edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at center, transparent 40%, theme(colors.canvas) 90%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Giant header with gradient text */}
        <h1 className="bg-gradient-to-b from-text via-text/80 to-text-dim bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent sm:text-6xl md:text-7xl">
          <span className="block">GEAR FOR THE</span>
          <span className="block text-neon">MAIN CHARACTER.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-sm text-text-dim">
          We source fully vetted, calibrated, and premium gaming/development
          machinery — no corporate scrap, no filler. Obsidian-vetted laptops
          that ship ready to perform.
        </p>

        {/* Interactive targets */}
        <div className="mt-10 flex items-center justify-center gap-5">
          <Link
            href="#marketplace"
            className="rounded border border-text bg-text px-5 py-2.5 text-xs font-bold text-canvas uppercase tracking-wider transition-colors hover:border-neon hover:text-neon"
          >
            [ SECURE THE SETUP ]
          </Link>
          <Link
            href="#cash-out"
            className="rounded border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-dim transition-colors hover:border-neon hover:text-neon"
          >
            [ OFFLOAD USED GEAR ]
          </Link>
        </div>
      </div>
    </section>
  );
}
