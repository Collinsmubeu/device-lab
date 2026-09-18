import type { ReactNode } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-mono">
      <Sidebar activeRole="client" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
