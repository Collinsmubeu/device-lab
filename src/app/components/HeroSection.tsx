"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";
import Logo from "@/app/components/Logo";

export default function HeroSection() {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden font-mono">
      <div className="absolute inset-0 bg-gradient-hero" />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, theme(colors.border) 1px, transparent 1px),
            linear-gradient(to bottom, theme(colors.border) 1px, transparent 1px)
           `,
          backgroundSize: "48px 48px",
          opacity: 0.1,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--info) 12%, transparent) 0%, transparent 45%), radial-gradient(circle at 70% 70%, color-mix(in oklab, var(--purple) 10%, transparent) 0%, transparent 45%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at center, transparent 35%, theme(colors.canvas) 85%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="xl" showPulse />
        </div>
        <h1 className="bg-gradient-to-b from-text via-text/80 to-text-dim bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent sm:text-6xl md:text-7xl">
          <span className="block">GEAR FOR THE</span>
          <span className="block text-neon">MAIN_CHARACTER.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-sm text-text-dim">
          We source fully vetted, calibrated, and premium gaming/development
          machinery — no corporate scrap, no filler. Obsidian-vetted laptops
          that ship ready to perform.
        </p>

        <div className="mt-10 flex items-center justify-center gap-5">
          <Link
            href="#marketplace"
            className="rounded border border-neon bg-neon/10 px-5 py-2.5 text-xs font-bold text-neon uppercase tracking-wider transition-all duration-200 hover:border-info hover:bg-info/10 hover:text-info hover:shadow-info-glow"
          >
            [ SECURE THE SETUP ]
          </Link>
          {isAuthenticated ? (
            <Link
              href="/trade-in"
              className="rounded border border-purple px-5 py-2.5 text-xs font-bold text-purple uppercase tracking-wider transition-all duration-200 hover:bg-purple/10 hover:text-purple hover:shadow-purple-glow"
            >
              [ OFFLOAD USED GEAR ]
            </Link>
          ) : (
            <Link
              href="/signin?callbackUrl=/trade-in"
              className="rounded border border-purple px-5 py-2.5 text-xs font-bold text-purple uppercase tracking-wider transition-all duration-200 hover:bg-purple/10 hover:text-purple hover:shadow-purple-glow"
            >
              [ SIGN_IN_TO_TRADE_IN ]
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
