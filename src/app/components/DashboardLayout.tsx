"use client";

import { useAuth } from "@/lib/auth-provider";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return null;
  }

  if (status !== "authenticated" || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Navbar />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-border">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}