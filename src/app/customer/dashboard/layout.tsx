import DashboardShell from "@/app/components/DashboardShell";
import type { ReactNode } from "react";

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>{children}</DashboardShell>
  );
}
