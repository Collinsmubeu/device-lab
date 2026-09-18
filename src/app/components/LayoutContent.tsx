"use client";

import type { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";

export default function LayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Navbar />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-border">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
