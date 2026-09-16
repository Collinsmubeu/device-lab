import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "[ ACCESS_DENIED // MISSING_CREDENTIALS ]" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "[ ACCESS DENIED // EMAIL ALREADY REGISTERED ]" },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });

    return NextResponse.json(
      { message: "[ ACCOUNT_CREATION_SUCCESSFUL // ROLE_ASSIGNED ]", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "[ REGISTRATION_FAILED // SERVER_ERROR ]" },
      { status: 500 }
    );
  }
}
