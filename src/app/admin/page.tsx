/**
 * Device Lab 254 — Owner Remote Management & Auditing Command Center
 *
 * `/admin` is a Server Component so the authentication check runs on the
 * server (un-bypassable from the client). Approving / terminating remote
 * payout overrides are Server Actions that re-verify the session on every
 * call (defense in depth) before mutating the read model.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth";
import {
  type AuditRow,
  type PendingPayout,
  approvePayout,
  getDashboardData,
  terminatePayout,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function money(v: number): string {
  return `KSh ${v.toLocaleString("en-KE")}`;
}

/**
 * Server Action: owner approves a manager's >KSh 30,000 remote cash outlay.
 * Re-checks the admin session, mutates the store, then revalidates the page.
 */
export async function approvePayoutAction(formData: FormData): Promise<void> {
  "use server";
  const session = await verifySession();
  if (!session || session.role !== "admin") return;
  const id = formData.get("id")?.toString() ?? "";
  const payout = approvePayout(id, session.userId);
  if (!payout) return;
  revalidatePath("/admin");
}

/**
 * Server Action: owner terminates a pending remote payout.
 */
export async function terminatePayoutAction(formData: FormData): Promise<void> {
  "use server";
  const session = await verifySession();
  if (!session || session.role !== "admin") return;
  const id = formData.get("id")?.toString() ?? "";
  const payout = terminatePayout(id, session.userId);
  if (!payout) return;
  revalidatePath("/admin");
}

/** Color accent tied to the payout threshold band (>KSh 30,000 triggers override). */
const OVERRIDE_FLOOR = 30000;

function statusTone(status: string): string {
  const s = status.toUpperCase();
  if (s.includes("MINT")) return "text-neon";
  if (s.includes("REPAIRED") || s.includes("QUOTED")) return "text-warning";
  if (s.includes("TERMINATED") || s.includes("COOKED") || s.includes("ARCHIVED"))
    return "text-danger";
  return "text-text-dim";
}

export default async function AdminPage() {
  const session = await verifySession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const data = getDashboardData();

  const marginPct =
    data.metrics.totalRevenueKsh > 0
      ? (data.metrics.netProfitMarginKsh / data.metrics.totalRevenueKsh) * 100
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
              operator: <span className="text-text">{session.userId}</span>
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
            label="CASH OUTLAYS"
            value={money(data.metrics.cashOutlaysKsh)}
            accent="text-text-dim"
          />
          <MetricCard
            label="NET PROFIT MARGIN"
            value={`${marginPct.toFixed(1)}%`}
            accent={
              data.metrics.netProfitMarginKsh >= 0 ? "text-neon" : "text-danger"
            }
          />
          <MetricCard
            label="DEVICES TAKEN TODAY"
            value={String(data.metrics.devicesTakenToday)}
            accent="text-neon"
          />
          <MetricCard
            label="ACTIVE STAFF"
            value={String(data.metrics.activeStaff)}
            accent="text-text-dim"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* ── Zone 2: Immutable Audit Log Terminal ── */}
          <section
            aria-labelledby="audit-heading"
            className="xl:col-span-1"
          >
            <h2
              id="audit-heading"
              className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim"
            >
              Live Remote Audit Trail
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

          {/* ── Zone 3: Remote Authorizations Queue ── */}
          <section
            aria-labelledby="payouts-heading"
            className="xl:col-span-2"
          >
            <h2
              id="payouts-heading"
              className="mb-2 flex items-baseline justify-between text-[10px] font-medium uppercase tracking-wider text-text-dim"
            >
              <span>Pending Remote Authorizations</span>
              <span className="text-text-dim">
                threshold: {money(OVERRIDE_FLOOR)}+ requires owner override
              </span>
            </h2>

            {data.pending.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-dim">
                {/* nothing in the pipeline right now */}
                no pending overrides.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.pending.map((p) => (
                  <PayoutCard
                    key={p.id}
                    payout={p}
                    approveAction={approvePayoutAction}
                    terminateAction={terminatePayoutAction}
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

function AuditRowView({ row }: { row: AuditRow }) {
  return (
    <div className="leading-tight text-text-dim">
      <span className="text-text">{row.timestamp} </span>
      <span className="text-text-dim">{row.staffId}</span>
      <span className="text-text-dim">{" // "}</span>
      <span className="text-text-dim">{row.action}</span>
      <span className="text-text-dim">{" // "}</span>
      <span className={statusTone(row.status)}>{row.status}</span>
    </div>
  );
}

// A single row of the authorizations pipeline. `approveAction`/`terminateAction`
// are bound Server Actions rendered as progressive-enhanced forms.
type PayoutAction = (formData: FormData) => void | Promise<void>;

function PayoutCard({
  payout,
  approveAction,
  terminateAction,
}: {
  payout: PendingPayout;
  approveAction: PayoutAction;
  terminateAction: PayoutAction;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-inner">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs text-text-dim">
            {payout.staffName} ({payout.staffId}) — {payout.role}
          </p>
          <p className="text-sm font-medium text-text">{payout.laptopId}</p>
          <p className="text-base font-bold text-warning">
            {money(payout.amountKsh)}
          </p>
          <p className="text-[10px] text-text-dim">{payout.requestedAt}</p>
          <p className="max-w-xs text-[10px] text-text-dim">
            reason: {payout.reason}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <form action={approveAction}>
            <input type="hidden" name="id" value={payout.id} />
            <button
              type="submit"
              className="rounded border border-neon bg-neon/10 px-3 py-1.5 text-[10px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
            >
              [ REMOTE AUTHORIZE ]
            </button>
          </form>
          <form action={terminateAction}>
            <input type="hidden" name="id" value={payout.id} />
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
