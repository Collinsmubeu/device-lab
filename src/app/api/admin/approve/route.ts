import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TransactionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "OWNER") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !["APPROVE", "TERMINATE"].includes(action)) {
      return NextResponse.json(
        { error: "Missing or invalid id/action" },
        { status: 400 },
      );
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        status:
          action === "APPROVE"
            ? TransactionStatus.SUCCESS
            : TransactionStatus.FAILED,
      },
    });

    await db.auditLog.create({
      data: {
        action: `remote_payout_${action.toLowerCase()}`,
        details: `Admin ${session.user?.id ?? "unknown"} ${action.toLowerCase()}d transaction ${id} for KSh ${transaction.amount.toLocaleString("en-KE")}`,
        staff: { connect: { id: session.user?.id ?? "" } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `[ ${action === "APPROVE" ? "PAYOUT_APPROVED" : "PAYOUT_TERMINATED"} ]`,
      transaction,
    });
  } catch (error) {
    console.error("[SYS_API] // approve/terminate error:", error);
    return NextResponse.json(
      { error: "Transaction not found or database error" },
      { status: 500 },
    );
  }
}
