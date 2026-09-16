import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LaptopStatus, TransactionStatus, TransactionType } from "@prisma/client";
import { PAYOUT_OVERRIDE_FLOOR_KSH } from "@/lib/config";

export async function GET() {
  try {
    const [revenueAgg, outlayAgg, activeCount, audit, pending] =
      await Promise.all([
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
        db.auditLog.findMany({
          orderBy: { timestamp: "desc" },
          take: 100,
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

    return NextResponse.json({
      metrics: {
        totalRevenueKsh: revenueAgg._sum.amount ?? 0,
        cashOutlaysKsh: outlayAgg._sum.amount ?? 0,
        netProfitMargin:
          (revenueAgg._sum.amount ?? 0) - (outlayAgg._sum.amount ?? 0),
        activeTickets: activeCount,
      },
      audit,
      pending,
    });
  } catch (error) {
    console.error("[SYS_API] // dashboard error:", error);
    return NextResponse.json(
      {
        metrics: {
          totalRevenueKsh: 0,
          cashOutlaysKsh: 0,
          netProfitMargin: 0,
          activeTickets: 0,
        },
        audit: [],
        pending: [],
      },
      { status: 500 },
    );
  }
}
