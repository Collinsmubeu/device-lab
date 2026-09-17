import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = await getToken({ req: request });

  if (!token?.email) {
    return NextResponse.redirect(new URL("/signin", url));
  }

  const role = token.role as string | undefined;
  const baseUrl = new URL("/", url);

  if (role === "OWNER") {
    return NextResponse.redirect(new URL("/admin/dashboard", baseUrl));
  } else if (role === "WORKER") {
    return NextResponse.redirect(new URL("/staff/dashboard", baseUrl));
  } else {
    return NextResponse.redirect(new URL("/customer/dashboard", baseUrl));
  }
}
