"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/app/components/HeroSection";
import LaptopCatalog from "@/app/components/LaptopCatalog";

const STREAM_MESSAGES = [
  ">> INTAKE_LOG // OVERCLOCKING_RAM_REGISTRIES_INITIATED",
  ">> DETECTING // NVMe_SSD_STORAGES // 100%_HEALTH_VERIFIED",
  ">> BOOTING // RTX_4070_GPU_CORES // THERMALS_CALIBRATED",
  ">> OPTIMIZING // LIQUID_METAL_THERMAL_PASTING",
  ">> ASSEMBLING // CUSTOM_VINYL_SKIN_WRAPS",
] as const;

const ACCESSORIES = [
  {
    label: "DEV_LAPTOP // STICKER_DECKED",
    node: (
      <svg viewBox="0 0 220 140" className="h-32 w-auto" aria-hidden="true">
        <rect x="30" y="25" width="160" height="95" rx="8" className="fill-card-2 stroke-border" strokeWidth="2" />
        <rect x="42" y="37" width="136" height="62" rx="4" className="fill-canvas stroke-border" strokeWidth="1.5" />
        <path d="M10 122 h200 l-14 12 h-172 z" className="fill-card stroke-border" strokeWidth="2" />
        <circle cx="110" cy="130" r="3" className="fill-neon" />
        <rect x="52" y="48" width="30" height="8" rx="2" className="fill-neon opacity-70" />
        <rect x="52" y="62" width="52" height="6" rx="2" className="fill-text-dim opacity-40" />
        <rect x="52" y="74" width="40" height="6" rx="2" className="fill-text-dim opacity-40" />
        <path d="M150 50 l18 18 m0 -18 l-18 18" className="stroke-neon" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "GPU_CORE // RTX_4070_CLASS",
    node: (
      <svg viewBox="0 0 220 140" className="h-32 w-auto" aria-hidden="true">
        <rect x="20" y="35" width="180" height="60" rx="8" className="fill-card-2 stroke-border" strokeWidth="2" />
        <circle cx="75" cy="65" r="20" className="fill-canvas stroke-neon" strokeWidth="2.5" />
        <circle cx="75" cy="65" r="8" className="fill-neon opacity-80" />
        <circle cx="140" cy="65" r="20" className="fill-canvas stroke-border" strokeWidth="2.5" />
        <circle cx="140" cy="65" r="8" className="fill-text-dim opacity-50" />
        <path d="M30 105 h160" className="stroke-border" strokeWidth="4" />
        <path d="M45 95 v10 M65 95 v10 M85 95 v10 M105 95 v10 M125 95 v10 M145 95 v10" className="stroke-border" strokeWidth="3" />
        <rect x="170" y="45" width="20" height="12" rx="2" className="fill-neon opacity-60" />
      </svg>
    ),
  },
  {
    label: "RAM_STICK // DDR5_32GB",
    node: (
      <svg viewBox="0 0 220 140" className="h-32 w-auto" aria-hidden="true">
        <rect x="25" y="45" width="170" height="45" rx="6" className="fill-card-2 stroke-neon" strokeWidth="2.5" />
        <rect x="38" y="55" width="22" height="25" rx="2" className="fill-border" />
        <rect x="68" y="55" width="22" height="25" rx="2" className="fill-border" />
        <rect x="98" y="55" width="22" height="25" rx="2" className="fill-border" />
        <rect x="128" y="55" width="22" height="25" rx="2" className="fill-neon opacity-70" />
        <rect x="158" y="55" width="22" height="25" rx="2" className="fill-border" />
        <path d="M30 98 h160 m-14 0 v8 m14 -8 v8 m14 -8 v8 m14 -8 v8 m14 -8 v8 m14 -8 v8 m14 -8 v8 m14 -8 v8" className="stroke-border" strokeWidth="3" />
      </svg>
    ),
  },
  {
    label: "NVMe_SSD // 2TB_HEALTH_100",
    node: (
      <svg viewBox="0 0 220 140" className="h-32 w-auto" aria-hidden="true">
        <rect x="35" y="45" width="150" height="50" rx="6" className="fill-card-2 stroke-neon" strokeWidth="2.5" />
        <rect x="50" y="58" width="45" height="24" rx="3" className="fill-border" />
        <rect x="105" y="58" width="30" height="24" rx="3" className="fill-neon opacity-70" />
        <rect x="145" y="58" width="25" height="24" rx="3" className="fill-border" />
        <path d="M60 45 v-12 h20 M110 45 v-12 h20 M150 45 v-12 h20" className="stroke-border" strokeWidth="2.5" />
        <circle cx="185" cy="70" r="6" className="fill-neon" />
      </svg>
    ),
  },
  {
    label: "COOLING_RIG // LIQUID_METAL",
    node: (
      <svg viewBox="0 0 220 140" className="h-32 w-auto" aria-hidden="true">
        <rect x="40" y="30" width="140" height="80" rx="10" className="fill-card-2 stroke-border" strokeWidth="2.5" />
        <circle cx="110" cy="70" r="28" className="fill-canvas stroke-neon" strokeWidth="2.5" />
        <circle cx="110" cy="70" r="14" className="fill-none stroke-neon" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M40 50 h-18 v40 h18 M180 50 h18 v40 h-18" className="stroke-border" strokeWidth="3" fill="none" />
        <path d="M22 70 q10 -14 18 0 q8 14 18 0 M180 70 q10 -14 18 0 q8 14 18 0" className="stroke-neon" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
] as const;

const INTRO_DURATION_MS = 60_000;
const TICK_MS = INTRO_DURATION_MS / 100;

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [streamIndex, setStreamIndex] = useState(0);
  const [bypassed, setBypassed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (progress >= 100 || bypassed) return;

    const timer = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [progress, bypassed]);

  useEffect(() => {
    const streamTimer = window.setInterval(() => {
      setStreamIndex((prev) => (prev + 1) % STREAM_MESSAGES.length);
    }, 4_000);

    return () => window.clearInterval(streamTimer);
  }, []);

  useEffect(() => {
    if (progress >= 100 || bypassed) {
      const revealTimer = window.setTimeout(() => setRevealed(true), 400);
      return () => window.clearTimeout(revealTimer);
    }
  }, [progress, bypassed]);

  if (!revealed) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas font-mono text-text">
        {/* Grid mesh backdrop */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, theme(colors.border) 1px, transparent 1px),
              linear-gradient(to bottom, theme(colors.border) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
            opacity: 0.15,
          }}
          aria-hidden="true"
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 30%, theme(colors.canvas) 85%), radial-gradient(circle at 70% 70%, color-mix(in oklab, var(--info) 4%, transparent) 0%, transparent 50%)",
          }}
          aria-hidden="true"
        />

        {/* Center console */}
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center">
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.35em] text-text-dim">
            [ DEVICE_LAB // BOOT_SEQUENCE ]
          </p>

          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl">
            <span className="text-text">[ CALIBRATING_SYSTEMS:</span>{" "}
            <span className="text-neon">{progress}%</span>{" "}
            <span className="text-text">]</span>
          </h1>

          {/* Progress bar */}
          <div className="mt-10 h-1.5 w-full max-w-xl overflow-hidden rounded-full border border-border bg-card">
            <div
              className="h-full bg-gradient-to-r from-neon via-info to-purple transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Rotating computer accessory visual */}
          <div
            key={streamIndex}
            className="mt-8 flex h-40 w-full max-w-xl animate-in fade-in slide-in-from-bottom-3 items-center justify-center rounded-xl border border-border bg-gradient-card px-6"
          >
            {ACCESSORIES[streamIndex].node}
          </div>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-text-dim">
            {ACCESSORIES[streamIndex].label}
          </p>

          {/* Hardware streamer */}
          <div className="mt-6 min-h-[2rem] w-full max-w-xl">
            <p
              key={streamIndex}
              className="animate-in fade-in slide-in-from-bottom-2 text-xs font-medium uppercase tracking-wider text-neon"
            >
              {STREAM_MESSAGES[streamIndex]}
            </p>
          </div>

          {/* Status ticks */}
          <div className="mt-8 flex items-center gap-2 text-[10px] text-text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_6px_theme(colors.neon)] animate-pulse" />
            <span>SYSTEMS_NOMINAL // HARDWARE_ARCHIVE_SYNCING</span>
          </div>
        </div>

        {/* Bypass link */}
        <button
          type="button"
          onClick={() => {
            setProgress(100);
            setBypassed(true);
          }}
          className="absolute bottom-6 right-6 z-20 rounded border border-border bg-card/60 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-text-dim transition-all duration-200 hover:border-info hover:text-info hover:shadow-info-glow"
        >
          [ BYPASS_INTRO ]
        </button>
      </main>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />

        <section
          id="marketplace"
          aria-labelledby="marketplace-heading"
          className="mt-16"
        >
          <h2
            id="marketplace-heading"
            className="mb-6 text-xs font-medium uppercase tracking-wider text-info"
          >
            Current Drops
          </h2>
          <LaptopCatalog />
        </section>

      <section
        id="cash-out"
        aria-labelledby="cash-out-heading"
        className="mt-16"
      >
        <h2
          id="cash-out-heading"
          className="mb-6 text-xs font-medium uppercase tracking-wider text-purple"
        >
          Offload Your Rig
        </h2>
        <p className="text-xs text-text-dim">
          Route your used hardware through the dedicated trade-in terminal for an
          instant, transparent valuation.
        </p>
        <a
          href="/trade-in"
          className="mt-4 inline-flex rounded border border-info bg-info/10 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-info transition-all duration-200 hover:bg-info/20 hover:shadow-info-glow"
        >
          [ OPEN_TRADE_IN_TERMINAL ]
        </a>
      </section>
      </main>
    </div>
  );
}