"use client";

import { useEffect, useState, useCallback } from "react";
import type { AuditLog, Transaction } from "@prisma/client";

export interface SystemMetrics {
  totalRevenueKsh: number;
  cashOutlaysKsh: number;
  netProfitMargin: number;
  activeTickets: number;
}

export interface DashboardData {
  metrics: SystemMetrics;
  audit: AuditLog[];
  pending: Transaction[];
}

/**
 * Admin LiveDashboard — polls the server every 10s for fresh audit log
 * entries and system metrics. Binds directly to the toggleRemoteApproval
 * server action for immediate override feedback.
 */

function money(v: number): string {
  return `KSh ${v.toLocaleString("en-KE")}`;
}

function formatLogEntry(timestamp: Date | string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });
}

function statusTone(status: string): string {
  const s = status.toUpperCase();
  if (s.includes("SUCCESS") || s.includes("MINT") || s.includes("VAULT")) return "text-neon";
  if (s.includes("PENDING") || s.includes("REPAIRED") || s.includes("QUOTED"))
    return "text-warning";
  if (s.includes("FAILED") || s.includes("COOKED") || s.includes("TERMINATED") || s.includes("ARCHIVED"))
    return "text-danger";
  return "text-text-dim";
}

export default function LiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json: DashboardData = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      await fetchData();
      if (!cancelled) {
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
      }
    };

    void tick();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "APPROVE" }),
    });
    if (res.ok) fetchData();
  };

  const handleTerminate = async (id: string) => {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "TERMINATE" }),
    });
    if (res.ok) fetchData();
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-canvas font-mono text-text-dim p-4">
        <p>[ SYS_BOOT // INITIALIZING_COMMAND_CENTER... ]</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-canvas font-mono text-danger p-4">
        <p>[ ERROR // {error} ]</p>
      </div>
    );
  }

  if (!data) return null;

  const marginPct =
    data.metrics.totalRevenueKsh > 0
      ? (data.metrics.netProfitMargin / data.metrics.totalRevenueKsh) * 100
      : 0;

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
              :: LIVE_DASHBOARD ::
            </span>
          </div>
          <span className="text-[10px] text-text-dim">
            {new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Africa/Nairobi",
            })}{" "}
            EAT
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* ── Zone 1: Executive Metrics ── */}
        <section
          aria-labelledby="metrics-heading"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <h2 id="metrics-heading" className="sr-only">
            Executive metrics
          </h2>
          <MetricCard
            label="TOTAL REVENUE"
            value={money(data.metrics.totalRevenueKsh)}
            accent="text-neon"
          />
          <MetricCard
            label="TRADE-IN CASH OUTLAYS"
            value={money(data.metrics.cashOutlaysKsh)}
            accent="text-text-dim"
          />
          <MetricCard
            label="NET PROFIT MARGIN"
            value={`${marginPct.toFixed(1)}%`}
            accent={
              data.metrics.netProfitMargin >= 0 ? "text-neon" : "text-danger"
            }
          />
          <MetricCard
            label="ACTIVE TICKETS"
            value={String(data.metrics.activeTickets)}
            accent="text-neon"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* ── Zone 2: Live Audit Log Terminal ── */}
          <section aria-labelledby="audit-heading" className="xl:col-span-1">
            <h2
              id="audit-heading"
              className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim"
            >
              Live Audit Trail
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

          {/* ── Zone 3: Remote Authorization Pipeline ── */}
          <section aria-labelledby="payouts-heading" className="xl:col-span-2">
            <h2
              id="payouts-heading"
              className="mb-2 flex items-baseline justify-between text-[10px] font-medium uppercase tracking-wider text-text-dim"
            >
              <span>Pending Remote Authorizations</span>
              <span className="text-text-dim">
                threshold: {money(30000)}+ requires owner override
              </span>
            </h2>

            {data.pending.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-dim">
                no pending overrides.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.pending.map((p) => (
                  <PayoutCard
                    key={p.id}
                    payout={p}
                    onApprove={() => handleApprove(p.id)}
                    onTerminate={() => handleTerminate(p.id)}
                  />
                ))}
              </div>
            )}
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
  const time = formatLogEntry(row.timestamp);
  return (
    <div className="leading-tight text-text-dim">
      <span className="text-text">{time} </span>
      <span className="text-text-dim">{row.staffId}</span>
      <span className="text-text-dim">{" // "}</span>
      <span className="text-text-dim">{row.action}</span>
      <span className="text-text-dim">{" // "}</span>
      <span className={statusTone(row.details)}>{row.details}</span>
    </div>
  );
}

function PayoutCard({
  payout,
  onApprove,
  onTerminate,
}: {
  payout: Transaction;
  onApprove: () => void;
  onTerminate: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-inner">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs text-text-dim">
            Transaction #{payout.id.slice(0, 8)}
          </p>
          <p className="text-sm font-medium text-text">
            {money(payout.amount)}
          </p>
          <p className="text-[10px] text-text-dim">
            {payout.createdAt.toLocaleString("en-GB", {
              timeZone: "Africa/Nairobi",
            })}
          </p>
          <p className="max-w-xs text-[10px] text-text-dim">
            {payout.mpesaReceipt ?? "Awaiting M-Pesa receipt"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="rounded border border-neon bg-neon/10 px-3 py-1.5 text-[10px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
          >
            [ REMOTE AUTHORIZE ]
          </button>
          <button
            type="button"
            onClick={onTerminate}
            className="rounded border border-danger bg-danger/10 px-3 py-1.5 text-[10px] font-mono font-bold text-danger uppercase tracking-wider transition hover:bg-danger/20"
          >
            [ TERMINATE ACTION ]
          </button>
        </div>
      </div>
    </div>
  );
}
