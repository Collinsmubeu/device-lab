import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveSessionFromCookie } from "@/lib/auth-edge";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const PUBLIC_ROUTES = ["/signin"];

const PROTECTED_ROUTES: { prefix: string; exact?: boolean; allowedRoles: string[] }[] = [
  { prefix: "/", exact: true, allowedRoles: ["OWNER", "WORKER", "CUSTOMER"] },
  { prefix: "/admin/dashboard", allowedRoles: ["OWNER"] },
  { prefix: "/staff/dashboard", allowedRoles: ["OWNER", "WORKER"] },
  { prefix: "/customer/dashboard", allowedRoles: ["OWNER", "WORKER", "CUSTOMER"] },
  { prefix: "/trade-in", allowedRoles: ["OWNER", "WORKER", "CUSTOMER"] },
];

function getDashboardForRole(role: string): string {
  switch (role) {
    case "OWNER":
      return "/admin/dashboard";
    case "WORKER":
      return "/staff/dashboard";
    case "CUSTOMER":
      return "/customer/dashboard";
    default:
      return "/customer/dashboard";
  }
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function findProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.find((route) =>
    route.exact ? pathname === route.prefix : pathname.startsWith(route.prefix)
  );
}

async function resolveSession(request: NextRequest) {
  // 1. Try NextAuth JWT first (used by /signin flow)
  const token = await getToken({ req: request });
  if (token?.role) {
    return { role: token.role as string, authenticated: true };
  }

  // 2. Fall back to the custom session cookie (used by /admin/login)
  const cookie = request.cookies.get("dl254_session")?.value;
  const custom = await resolveSessionFromCookie(cookie);
  if (custom?.role) {
    return { role: custom.role, authenticated: true };
  }

  return { role: undefined, authenticated: false };
}

function redirectSignIn(request: NextRequest, pathname: string) {
  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(signInUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Public routes (signin) - always accessible
  if (isPublicRoute(pathname)) {
    const { role, authenticated } = await resolveSession(request);
    if (authenticated && role) {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }
    return NextResponse.next();
  }

  // ALL OTHER ROUTES REQUIRE AUTHENTICATION
  const { role, authenticated } = await resolveSession(request);
  if (!authenticated || !role) return redirectSignIn(request, pathname);

  // /admin and /staff top-level routes — OWNER only
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (role !== "OWNER") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/staff" || pathname.startsWith("/staff/")) {
    if (role !== "OWNER" && role !== "WORKER") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }
    return NextResponse.next();
  }

  // Check protected route permissions
  const protectedRoute = findProtectedRoute(pathname);
  if (protectedRoute) {
    if (!protectedRoute.allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
