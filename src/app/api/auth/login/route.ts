import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { createSessionCookie, UserRole, DEV_CREDENTIALS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: { email: string; password: string } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "[ ACCESS_DENIED // MISSING_CREDENTIALS ]" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const devCred = DEV_CREDENTIALS[normalizedEmail];
    if (devCred && process.env.NODE_ENV !== "production") {
      if (password === devCred.password) {
        const role: UserRole = devCred.role;
        const res = NextResponse.json(
          {
            message: "[ SESSION_INITIALIZED // ACCESS_GRANTED ]",
            role,
            email: normalizedEmail,
          },
          { status: 200 },
        );
        res.cookies.set(createSessionCookie(`dev-${role.toLowerCase()}`, normalizedEmail, role));
        return res;
      }
      return NextResponse.json(
        { message: "[ AUTHENTICATION_FAILED // INVALID_CREDENTIALS ]" },
        { status: 401 },
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "[ AUTHENTICATION_FAILED // INVALID_CREDENTIALS ]" },
        { status: 401 },
      );
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { message: "[ AUTHENTICATION_FAILED // INVALID_CREDENTIALS ]" },
        { status: 401 },
      );
    }

    const role = user.role as unknown as UserRole;

    const res = NextResponse.json(
      {
        message: "[ SESSION_INITIALIZED // ACCESS_GRANTED ]",
        role,
        email: user.email,
      },
      { status: 200 },
    );

    res.cookies.set(createSessionCookie(user.id, user.email, role));

    return res;
  } catch (error) {
    console.error("[ SYS_AUTH // LOGIN_ERROR ]:", error);
    return NextResponse.json(
      { message: "[ AUTHENTICATION_FAILED // SERVER_ERROR ]" },
      { status: 500 },
    );
  }
}
