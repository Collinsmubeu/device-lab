/**
 * Device Lab 254 — Server Actions Layer
 *
 * Native TypeScript Server Actions that communicate directly with the
 * PostgreSQL database via our Prisma singleton. These functions run on the
 * server and are never bundled to the client.
 */

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { LaptopStatus, TransactionStatus, TransactionType } from "@prisma/client";
import type { AuditLog, Laptop, Transaction } from "@prisma/client";
import { verifySession } from "@/lib/auth";
import { PAYOUT_OVERRIDE_FLOOR_KSH } from "@/lib/config";

export interface SystemMetrics {
  totalRevenueKsh: number;
  cashOutlaysKsh: number;
  activeInventoryCount: number;
  pendingPayouts: Transaction[];
}

export interface ApprovalResult {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

/**
 * Fetch live inventory from PostgreSQL — all laptops whose status is not
 * 'ARCHIVED', ordered newest-first.
 */
export async function getLiveInventory(): Promise<Laptop[]> {
  console.log("[SYS_FETCH] // Querying PostgreSQL for live inventory...");

  try {
    const laptops = await db.laptop.findMany({
      where: {
        status: {
          not: LaptopStatus.ARCHIVED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[SYS_FETCH] // Retrieved ${laptops.length} live laptop(s).`);
    return laptops;
  } catch (error) {
    console.error("[SYS_FETCH] // FATAL FETCH ERROR:", error);
    return [];
  }
}

/**
 * Compute system-level metrics for the owner dashboard.
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const [revenueAgg, outlayAgg, activeCount, pending] = await Promise.all([
      db.transaction.aggregate({
        where: {
          type: TransactionType.CASH_IN_SALE,
          status: TransactionStatus.SUCCESS,
        },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          type: TransactionType.CASH_OUT_TRADEIN,
          status: TransactionStatus.SUCCESS,
        },
        _sum: { amount: true },
      }),
      db.laptop.count({
        where: { status: LaptopStatus.AVAILABLE },
      }),
      db.transaction.findMany({
        where: {
          type: TransactionType.CASH_OUT_TRADEIN,
          status: TransactionStatus.PENDING,
          amount: { gte: PAYOUT_OVERRIDE_FLOOR_KSH },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      totalRevenueKsh: revenueAgg._sum.amount ?? 0,
      cashOutlaysKsh: outlayAgg._sum.amount ?? 0,
      activeInventoryCount: activeCount,
      pendingPayouts: pending,
    };
  } catch (error) {
    console.error("[SYS_FETCH] // METRICS ERROR:", error);
    return {
      totalRevenueKsh: 0,
      cashOutlaysKsh: 0,
      activeInventoryCount: 0,
      pendingPayouts: [],
    };
  }
}

/**
 * Approve or terminate a high-value remote payout.
 * Records an immutable audit log entry tied to the admin session.
 */
export async function toggleRemoteApproval(
  transactionId: string,
  action: "APPROVE" | "TERMINATE",
): Promise<ApprovalResult> {
  const session = await verifySession();

  if (!session || session.role !== "OWNER") {
    return {
      success: false,
      message: "[ ACCESS_DENIED // NOT_AUTHORIZED ]",
    };
  }

  try {
    const transaction = await db.transaction.update({
      where: { id: transactionId },
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
        details: `Admin ${session.userId} ${action.toLowerCase()}d transaction ${transactionId} for KSh ${transaction.amount.toLocaleString("en-KE")}`,
        staffId: session.userId,
      },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `[ ${action === "APPROVE" ? "PAYOUT_APPROVED" : "PAYOUT_TERMINATED"} // TRANSACTION_${transaction.id} ]`,
      transaction,
    };
  } catch (error) {
    console.error("[SYS_ACTION] // toggleRemoteApproval error:", error);
    return {
      success: false,
      message: "[ ERROR // TRANSACTION_NOT_FOUND ]",
    };
  }
}

/** Convenience: fetch all audit log entries for the dashboard terminal. */
export async function getAuditLogStream(): Promise<AuditLog[]> {
  try {
    return await db.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });
  } catch (error) {
    console.error("[SYS_FETCH] // AUDIT LOG ERROR:", error);
    return [];
  }
}
