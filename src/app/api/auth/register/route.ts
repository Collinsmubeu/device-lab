import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Prisma, UserRole as PrismaUserRole } from "@prisma/client";

const OWNER_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() ?? "cmubeu@gmail.com";

function resolveRole(email: string): PrismaUserRole {
  return email.trim().toLowerCase() === OWNER_EMAIL
    ? PrismaUserRole.OWNER
    : PrismaUserRole.CUSTOMER;
}

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

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "[ ACCESS_DENIED // INVALID_PAYLOAD ]" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "[ ACCESS DENIED // IDENTITY ARCHIVE CONFLICT ]" },
        { status: 400 },
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const role = resolveRole(normalizedEmail);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        emailVerified: null,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(
      {
        message: "[ ONBOARDING_SUCCESSFUL // ROLE_LOCKED_IN ]",
        user: { email: user.email, role: user.role },
        verificationToken,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "[ REGISTRATION_FAILED // IDENTITY_CONFLICT ]" },
        { status: 409 },
      );
    }
    console.error("[ SYS_AUTH // REGISTRATION_ERROR ]:", error);
    return NextResponse.json(
      { message: "[ REGISTRATION_FAILED // SERVER_ERROR ]" },
      { status: 500 },
    );
  }
}
