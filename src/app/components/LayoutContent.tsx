"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";

const NO_SIDEBAR_ROUTES = ["/", "/signin", "/admin/login", "/trade-in", "/admin/login"];
const HAS_OWN_LAYOUT_ROUTES = ["/admin/dashboard", "/staff/dashboard", "/customer/dashboard"];

export default function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasOwnLayout = HAS_OWN_LAYOUT_ROUTES.some((route) => pathname.startsWith(route));
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname) && !hasOwnLayout;

  if (!showSidebar) {
    return <>{children}</>;
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
