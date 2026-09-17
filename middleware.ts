import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

const OWNER_EMAIL = "cmubeu@gmail.com";

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  const token = await getToken({ req: request });
  const session = token
    ? {
        email: token.email,
        role: token.email?.toLowerCase() === OWNER_EMAIL ? "OWNER" : "CUSTOMER",
        name: token.name,
      }
    : null;

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "OWNER") {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff")) {
    if (!session || (session.role !== "WORKER" && session.role !== "OWNER")) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/customer")) {
    if (!session) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/cash-out")) {
    if (!session) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
