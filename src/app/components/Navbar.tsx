"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { ChevronDown, User } from "lucide-react";

const themes = [
  { id: "obsidian", label: "[ ⚡_OBSIDIAN ]", activeClass: "border-neon bg-neon/10 text-neon" },
  { id: "matrix", label: "[ ◯_MATRIX ]", activeClass: "border-info bg-info/10 text-info" },
  { id: "circuit", label: "[ ⎇_CIRCUIT ]", activeClass: "border-blue-400 bg-blue-400/10 text-blue-400" },
  { id: "rust", label: "[ 🔥_RUST ]", activeClass: "border-amber-500 bg-amber-500/10 text-amber-500" },
  { id: "friendly", label: "[ ☀_FRIENDLY ]", activeClass: "border-warning bg-warning/10 text-warning" },
  { id: "cyberpunk", label: "[ 🌙_CYBERPUNK ]", activeClass: "border-pink bg-pink/10 text-pink" },
  { id: "synthwave", label: "[ 🌊_SYNTHWAVE ]", activeClass: "border-info bg-info/10 text-info" },
  { id: "retro", label: "[ 🔥_RETRO ]", activeClass: "border-warning bg-warning/10 text-warning" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b font-mono text-xs transition-all duration-300 ${
        scrolled ? "border-border bg-canvas/80 backdrop-blur" : "border-transparent bg-canvas"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full border border-neon bg-neon shadow-neon-glow"></span>
              </span>
              <span className="text-xl font-black tracking-[0.4em] text-neon">
                D V C L B 254
              </span>
            </div>
            <span className="text-[9px] text-text-dim">
              Nairobi_HQ // Hardware_Archive
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="#marketplace" className="group relative text-text-dim transition-colors hover:text-neon">
            <span className="relative z-10">[ 01_MARKETPLACE ]</span>
            <span className="absolute bottom-0 left-0 right-0 h-px bg-neon/0 group-hover:bg-neon/50 transition-all duration-300"></span>
          </Link>
          <Link href="/trade-in" className="group relative text-text-dim transition-colors hover:text-neon">
            <span className="relative z-10">[ 02_TRADE_IN ]</span>
            <span className="absolute bottom-0 left-0 right-0 h-px bg-neon/0 group-hover:bg-neon/50 transition-all duration-300"></span>
          </Link>
          <Link href="#services" className="group relative text-text-dim transition-colors hover:text-neon">
            <span className="relative z-10">[ 03_SERVICES ]</span>
            <span className="absolute bottom-0 left-0 right-0 h-px bg-neon/0 group-hover:bg-neon/50 transition-all duration-300"></span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-info"></span>
          </span>
          <span className="hidden text-xs text-text-dim lg:inline">
            LIVE_INTAKE_OPEN
          </span>

          {/* Theme Switcher */}
          <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="Theme selector">
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`rounded border border-border px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? `${t.activeClass} shadow-neon-glow`
                      : "bg-card/40 text-text-dim hover:border-info hover:text-info hover:shadow-info-glow"
                  }`}
                  aria-pressed={isActive}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {session?.user && (
            <div className="relative flex items-center gap-2">
              <span className="hidden text-xs text-text-dim sm:inline">
                {session.user.email}
              </span>
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full border border-border bg-card/60 p-1.5 text-text-dim transition-all duration-200 hover:border-neon hover:text-neon"
                >
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}

          {!session && (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
