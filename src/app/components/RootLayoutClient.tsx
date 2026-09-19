"use client";

import { useAuth } from "@/lib/auth-provider";
import DashboardLayout from "@/app/components/DashboardLayout";
import AuthLayout from "@/app/components/AuthLayout";
import type { ReactNode } from "react";

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center text-text-dim font-mono">
          <div className="h-8 w-8 mx-auto mb-4 border-4 border-neon/30 border-t-neon rounded-full animate-spin" />
          <p className="text-[11px] uppercase tracking-wider">INITIALIZING_SYSTEM...</p>
        </div>
      </div>
    );
  }

  // Authenticated users ALWAYS get the dashboard shell (sidebar + navbar + footer)
  // regardless of which route they visit.
  if (status === "authenticated") {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Unauthenticated users get the auth layout (navbar + footer, no sidebar).
  // Middleware redirects protected routes to /signin before this renders.
  return <AuthLayout>{children}</AuthLayout>;
}
