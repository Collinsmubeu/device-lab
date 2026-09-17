import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/customer/:path*",
    "/checkout/:path*",
    "/cash-out/:path*",
  ],
};

const PUBLIC_ROUTES = ["/signin", "/_next", "/favicon.ico"];
const SESSION_COOKIE = "dl254_session";

interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

function b64UrlDecode(input: string): SessionPayload {
  const base = input.replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(base);
  return JSON.parse(json) as SessionPayload;
}

function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const body = token.slice(0, dot);

  try {
    const payload = b64UrlDecode(body);
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifyToken(token);

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "OWNER") {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff")) {
    if (!session || (session.role !== "WORKER" && session.role !== "OWNER")) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/customer")) {
    if (!session) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/cash-out")) {
    if (!session) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
