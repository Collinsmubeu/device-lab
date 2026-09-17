/**
 * Device Lab 254 — Owner Remote Management & Auditing Command Center
 *
 * `/admin` is a Server Component so the authentication check runs on the
 * server (un-bypassable from the client). The live dashboard component
 * polls `/api/admin/dashboard` for real-time updates and binds to the
 * `toggleRemoteApproval` server action.
 */

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import LiveDashboard from "./LiveDashboard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  const session = await verifySession();
  if (!session || session.role !== "OWNER") {
    redirect("/signin");
  }

  return <LiveDashboard />;
}
