"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SessionInfo {
  userId: string;
  email: string;
  role: "OWNER" | "WORKER" | "CUSTOMER";
  exp: number;
}

export default function DynamicNavbarWrapper() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { session: SessionInfo | null }) => {
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 border-b border-border bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="font-mono text-xs tracking-widest text-text-dim">
            D V C L B // 254
          </span>
          <span className="text-[10px] text-text-dim animate-pulse">
            [ LOADING_SESSION ]
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left Zone */}
        <div className="flex flex-col">
          <Link href="/" className="text-xs tracking-[0.3em] text-text">
            D V C L B // 254
          </Link>
          <span className="text-[9px] text-text-dim">
            Nairobi_HQ // Hardware.Archive
          </span>
        </div>

        {/* Right Zone: Role-based actions */}
        <div className="flex items-center gap-4">
          {!session ? (
            <>
              <Link
                href="/signin"
                className="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-[11px] font-mono font-bold text-text-dim uppercase tracking-wider transition-colors hover:border-neon hover:text-neon"
              >
                [ JOIN_THE_LAB // SIGN_IN ]
              </Link>
            </>
          ) : session.role === "OWNER" ? (
            <>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-neon">
                <span className="h-2 w-2 animate-pulse rounded-full bg-neon shadow-[0_0_6px_theme(colors.neon)]"></span>
                OWNER_ACTIVE
              </span>
              <Link
                href="/admin/dashboard"
                className="rounded border border-neon bg-neon/10 px-3 py-1.5 text-[11px] font-mono font-bold text-neon uppercase tracking-wider transition-colors hover:bg-neon/20"
              >
                [ ADMIN_DASHBOARD ]
              </Link>
            </>
          ) : session.role === "WORKER" ? (
            <>
              <span className="text-[11px] font-mono text-warning">
                [ INTAKE_PORTAL_ACTIVE ]
              </span>
              <Link
                href="/staff/dashboard"
                className="text-[11px] font-mono text-text-dim uppercase tracking-wider transition-colors hover:text-neon"
              >
                [ STAFF_PORTAL ]
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/customer/dashboard"
                className="text-[11px] font-mono text-text-dim uppercase tracking-wider transition-colors hover:text-neon"
              >
                [ CUSTOMER_VAULT ]
              </Link>
            </>
          )}

          {session && (
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded border border-border px-3 py-1.5 text-[11px] font-mono font-bold text-text-dim uppercase tracking-wider transition-colors hover:border-danger hover:text-danger"
              >
                [ TERMINATE_SESSION // LOG_OUT ]
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
