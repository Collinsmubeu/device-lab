import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      image: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ message: "Missing userId or role" }, { status: 400 });
    }

    if (!["WORKER", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ message: "Invalid role. Must be WORKER or CUSTOMER" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent owner from changing their own role
    if (targetUser.email === session.user?.email) {
      return NextResponse.json({ message: "Cannot change your own role" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: { id: true, email: true, role: true },
    });

    await db.auditLog.create({
      data: {
        action: "role_changed",
        details: `Changed ${targetUser.email} role to ${role}`,
        staffId: session.user.id ?? "",
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH_ERROR]:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent owner from deleting themselves
    if (targetUser.email === session.user?.email) {
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 });
    }

    await db.user.delete({ where: { id: userId } });

    await db.auditLog.create({
      data: {
        action: "user_deleted",
        details: `Deleted user ${targetUser.email}`,
        staffId: session.user.id ?? "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_USERS_DELETE_ERROR]:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}