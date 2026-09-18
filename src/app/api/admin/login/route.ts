import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = (form.get("email")?.toString() ?? "").trim().toLowerCase();
  const password = form.get("password")?.toString() ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "[ ACCESS_DENIED // MISSING_CREDENTIALS ]" },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "[ ACCESS_DENIED // IDENTITY_NOT_FOUND ]" },
      { status: 401 },
    );
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "[ ACCESS_DENIED // INVALID_PASSCODE ]" },
      { status: 401 },
    );
  }

  if (user.role !== "OWNER") {
    return NextResponse.json(
      { error: "[ ACCESS_DENIED // INSUFFICIENT_PRIVILEGES ]" },
      { status: 403 },
    );
  }

  const res = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  res.cookies.set(createSessionCookie(user.id, user.email, user.role));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, message: "Logged out." });
  res.cookies.set(clearSessionCookie());
  return res;
}
