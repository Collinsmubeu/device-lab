import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const PUBLIC_ROUTES = ["/", "/trade-in", "/admin/login"];
const AUTH_ROUTES = ["/signin"];
const PROTECTED_ROUTES: { prefix: string; allowedRoles: string[] }[] = [
  { prefix: "/admin/dashboard", allowedRoles: ["OWNER"] },
  { prefix: "/staff/dashboard", allowedRoles: ["OWNER", "WORKER"] },
  { prefix: "/customer/dashboard", allowedRoles: ["OWNER", "CUSTOMER"] },
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

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  if (isPublic) return NextResponse.next();

  const token = await getToken({ req: request });

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (token?.role) {
      const dashboard = getDashboardForRole(token.role as string);
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.next();
  }

  const protectedRoute = PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix));
  if (protectedRoute) {
    if (!token || !token.role) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (!protectedRoute.allowedRoles.includes(token.role as string)) {
      return NextResponse.redirect(new URL(getDashboardForRole(token.role as string), request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
