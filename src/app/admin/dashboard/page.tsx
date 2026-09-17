/**
 * Device Lab 254 — Owner Control Center
 *
 * Supreme command center with:
 * 1. Executive Capital Grid (live DB aggregations)
 * 2. Remote Approval Lock (pending payout pipeline)
 * 3. Zero-Tamper System Audit Terminal (read-only audit trail)
 */

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TransactionStatus, TransactionType, UserRole, LaptopStatus } from "@prisma/client";
import type { AuditLog, Transaction } from "@prisma/client";
import { toggleRemoteApproval } from "@/app/actions/laptopActions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function money(v: number): string {
  return `KSh ${v.toLocaleString("en-KE")}`;
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });
}

async function getDashboardData() {
  const [revenueAgg, outlayAgg, activeCount, audit, pending] = await Promise.all([
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
      take: 50,
    }),
    db.transaction.findMany({
      where: {
        type: TransactionType.CASH_OUT_TRADEIN,
        status: TransactionStatus.PENDING,
        amount: { gte: 30000 },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalRevenueKsh: revenueAgg._sum.amount ?? 0,
    cashOutlaysKsh: outlayAgg._sum.amount ?? 0,
    activeInventoryCount: activeCount,
    audit,
    pending,
  };
}

export default async function OwnerDashboard() {
  const session = await verifySession();
  if (!session || session.role !== "OWNER") {
    redirect("/signin");
  }

  const data = await getDashboardData();

  const netMargin = data.totalRevenueKsh > 0
    ? ((data.totalRevenueKsh - data.cashOutlaysKsh) / data.totalRevenueKsh) * 100
    : 0;

  const employeeCount = await db.user.count({
    where: { role: UserRole.WORKER },
  });

  return (
    <main className="min-h-screen w-full bg-canvas font-mono text-text">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/60 px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs tracking-widest text-text-dim sm:text-sm">
              [ DEVICE LAB 254 :: OWNER COMMAND CENTER ]
            </span>
            <span className="hidden text-xs text-text-dim sm:inline">
              operator: <span className="text-text">{session.email}</span>
            </span>
          </div>
          <span className="text-[10px] text-text-dim">
            {formatTime(new Date())} EAT
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* ── Zone 1: Executive Capital Grid ── */}
        <section
          aria-labelledby="metrics-heading"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <h2 id="metrics-heading" className="sr-only">
            Executive metrics
          </h2>
          <MetricCard
            label="TOTAL_SALES_REVENUE"
            value={money(data.totalRevenueKsh)}
            accent="text-neon"
          />
          <MetricCard
            label="TOTAL_PAYOUTS_OUTLAY"
            value={money(data.cashOutlaysKsh)}
            accent="text-text-dim"
          />
          <MetricCard
            label="STORE_NET_MARGINS"
            value={`${netMargin.toFixed(1)}%`}
            accent={netMargin >= 0 ? "text-neon" : "text-danger"}
          />
          <MetricCard
            label="ACTIVE_EMPLOYEE_COUNT"
            value={String(employeeCount)}
            accent="text-neon"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* ── Zone 2: Remote Approval Lock ── */}
          <section aria-labelledby="payouts-heading" className="xl:col-span-2">
            <h2
              id="payouts-heading"
              className="mb-2 flex items-baseline justify-between text-[10px] font-medium uppercase tracking-wider text-text-dim"
            >
              <span>Pending Remote Authorizations (&gt; KSh 30,000)</span>
              <span className="text-text-dim">
                queue: {data.pending.length}
              </span>
            </h2>

            {data.pending.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-dim">
                no pending overrides.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.pending.map((p) => (
                  <ApprovalCard key={p.id} tx={p} />
                ))}
              </div>
            )}
          </section>

          {/* ── Zone 3: Zero-Tamper Audit Terminal ── */}
          <section aria-labelledby="audit-heading" className="xl:col-span-1">
            <h2
              id="audit-heading"
              className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim"
            >
              Live System Audit Terminal
            </h2>
            <div
              aria-live="polite"
              className="relative h-[38rem] overflow-y-auto rounded-xl border border-border bg-card/60 p-3 font-mono text-[11px] sm:text-xs"
            >
              <span className="absolute top-2 right-2 text-[9px] text-text-dim">
                :: READ-ONLY ::
              </span>
              <div className="mt-4 space-y-1.5 pr-2">
                {data.audit.map((row) => (
                  <AuditRowView key={row.id} row={row} />
                ))}
                <div className="mt-2 h-3 w-3 rounded-full bg-neon shadow-[0_0_6px_theme(colors.neon)] animate-pulse" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 shadow-inner">
      <span className="block text-[10px] uppercase tracking-wider text-text-dim">
        {label}
      </span>
      <span className={`mt-1 block text-2xl font-bold ${accent}`}>{value}</span>
    </div>
  );
}

function AuditRowView({ row }: { row: AuditLog }) {
  return (
    <div className="leading-tight text-text-dim">
      <span className="text-text">{`[${formatTime(row.timestamp)}] `} </span>
      <span className="text-text-dim">{row.staffId}</span>
      <span className="text-text-dim">{" // "}</span>
      <span className="text-text-dim">{row.action}</span>
      <span className="text-text-dim">{" // "}</span>
      <span className="text-text-dim">{row.details}</span>
    </div>
  );
}

async function ApprovalCard({ tx }: { tx: Transaction }) {
  const approve = async () => {
    "use server";
    await toggleRemoteApproval(tx.id, "APPROVE");
  };

  const terminate = async () => {
    "use server";
    await toggleRemoteApproval(tx.id, "TERMINATE");
  };

  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-inner">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs text-text-dim">
            Transaction #{tx.id.slice(0, 8)}
          </p>
          <p className="text-sm font-medium text-text">
            {money(tx.amount)}
          </p>
          <p className="text-[10px] text-text-dim">
            {tx.createdAt.toLocaleString("en-GB", {
              timeZone: "Africa/Nairobi",
            })}
          </p>
          <p className="max-w-xs text-[10px] text-text-dim">
            {tx.mpesaReceipt ?? "Awaiting M-Pesa receipt"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <form action={approve}>
            <input type="hidden" name="id" value={tx.id} />
            <button
              type="submit"
              className="rounded border border-neon bg-neon/10 px-3 py-1.5 text-[10px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
            >
              [ REMOTE AUTHORIZE PAYOUT ]
            </button>
          </form>
          <form action={terminate}>
            <input type="hidden" name="id" value={tx.id} />
            <button
              type="submit"
              className="rounded border border-danger bg-danger/10 px-3 py-1.5 text-[10px] font-mono font-bold text-danger uppercase tracking-wider transition hover:bg-danger/20"
            >
              [ TERMINATE ACTION ]
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
