import DashboardShell from "@/app/components/DashboardShell";
import type { ReactNode } from "react";

export default function StaffDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>{children}</DashboardShell>
  );
}
