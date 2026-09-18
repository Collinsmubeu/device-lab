"use client";

import { useAuth } from "@/lib/auth-provider";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
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

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Navbar />
      </header>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}