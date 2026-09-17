import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSessionCookie, clearSessionCookie, DEV_ADMIN } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = (form.get("email")?.toString() ?? "").trim();
  const password = form.get("password")?.toString() ?? "";

  const okEmail = email === DEV_ADMIN.email;
  const okPass = password === DEV_ADMIN.password;
  if (!okEmail || !okPass) {
    return NextResponse.json(
      { error: "Invalid credentials. This is a demo admin." },
      { status: 401 },
    );
  }

  const role = email === DEV_ADMIN.email ? "OWNER" : "WORKER";
  const res = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  res.cookies.set(createSessionCookie(email, email, role));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, message: "Logged out." });
  res.cookies.set(clearSessionCookie());
  return res;
}
