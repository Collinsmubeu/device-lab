import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  const token = await getToken({ req: request });
  const role = token?.role as string | undefined;

  // Helper to redirect to signin
  const redirectToSignin = () => {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/admin")) {
    if (!token || role !== "OWNER") {
      return redirectToSignin();
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff")) {
    if (!token || (role !== "WORKER" && role !== "OWNER")) {
      return redirectToSignin();
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/customer")) {
    if (!token) {
      return redirectToSignin();
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/cash-out")) {
    if (!token) {
      return redirectToSignin();
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
