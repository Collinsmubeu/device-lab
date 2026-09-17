/**
 * Device Lab 254 — Owner Remote Management & Auditing Command Center
 *
 * `/admin` is a Server Component so the authentication check runs on the
 * server (un-bypassable from the client). The live dashboard component
 * polls `/api/admin/dashboard` for real-time updates and binds to the
 * `toggleRemoteApproval` server action.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import LiveDashboard from "./LiveDashboard";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "OWNER") {
    redirect("/signin");
  }

  return <LiveDashboard />;
}
