"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";

export default function LayoutContent({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  const isAuthenticated = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Navbar />
      </header>
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && (
          <aside className="w-64 shrink-0 border-r border-border">
            <Sidebar />
          </aside>
        )}
        <main className={`flex-1 overflow-y-auto ${isAuthenticated ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
