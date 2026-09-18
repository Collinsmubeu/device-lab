"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import { useSession } from "next-auth/react";
import { ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

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
          <Logo size="md" showPulse />
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

          {session?.user && (
            <div className="relative flex items-center gap-2">
              <span className="hidden text-xs text-text-dim sm:inline">
                {session.user.email}
              </span>
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full border border-border bg-card/60 p-1 text-text-dim transition-all duration-200 hover:border-neon hover:text-neon"
                >
                  <div className="relative h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-neon/30 to-info/30 flex items-center justify-center">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.email ?? "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-text-dim" />
                    )}
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-neon border-2 border-canvas" />
                  </div>
                  <ChevronDown className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <p className="px-3 py-2 text-[11px] font-mono font-bold text-text-dim">{session.user.email}</p>
                    <span className="px-3 py-1 text-[10px] font-mono text-neon capitalize">{(session.user as { role?: string })?.role?.toLowerCase() ?? "customer"}</span>
                  </div>
                  <hr className="border-border mx-2" />
                  <Link
                    href="/api/auth/signout"
                    className="block px-3 py-2 text-[11px] font-mono text-danger hover:bg-danger/10 transition-colors"
                  >
                    [ LOGOUT ]
                  </Link>
                </div>
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
