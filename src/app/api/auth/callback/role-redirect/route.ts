import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const role = session.user.role ?? "CUSTOMER";

  if (role === "OWNER") {
    redirect("/admin/dashboard");
  } else if (role === "WORKER") {
    redirect("/staff/dashboard");
  } else {
    redirect("/customer/dashboard");
  }
}
