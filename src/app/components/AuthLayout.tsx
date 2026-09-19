"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
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
