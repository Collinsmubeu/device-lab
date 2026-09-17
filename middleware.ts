import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = new URL(request.url);

  console.log("[MIDDLEWARE] Intercept:", { pathname, search });

  return NextResponse.next();
}
