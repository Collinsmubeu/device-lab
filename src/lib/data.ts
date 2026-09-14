/**
 * Device Lab 254 — Owner Command Center data model.
 *
 * NOTE: This is an in-memory stand-in for the production Postgres read model.
 * Every field lives in `src/lib/data.ts` so the Server Component page, the
 * server actions and the payout route handler share a single source of truth.
 * Swap `store` for a real DB (Drizzle/Prisma) behind the same function names
 * and nothing above this module breaks.
 */

export type StaffRole = "admin" | "manager" | "tech";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}

export interface Metrics {
  totalRevenueKsh: number;
  cashOutlaysKsh: number;
  netProfitMarginKsh: number;
  devicesTakenToday: number;
  activeStaff: number;
}

export interface AuditRow {
  id: string;
  timestamp: string; // "[HH:MM]"
  staffId: string;
  action: string;
  status: string;
}

export interface PendingPayout {
  id: string;
  staffId: string;
  staffName: string;
  laptopId: string;
  amountKsh: number;
  reason: string;
  requestedAt: string; // "[HH:MM]"
  role: Exclude<StaffRole, "admin">;
}

export interface DashboardData {
  metrics: Metrics;
  audit: AuditRow[];
  pending: PendingPayout[];
}

const STAFF: Staff[] = [
  { id: "Staff_Kamau", name: "Kamau", role: "tech" },
  { id: "Staff_Amina", name: "Amina", role: "manager" },
  { id: "Staff_Brian", name: "Brian", role: "tech" },
  { id: "Staff_Mary", name: "Mary", role: "manager" },
];

const store: {
  metrics: Metrics;
  audit: AuditRow[];
  pending: PendingPayout[];
  seq: number;
} = {
  metrics: {
    totalRevenueKsh: 1428500,
    cashOutlaysKsh: 582000,
    netProfitMarginKsh: 846500,
    devicesTakenToday: 7,
    activeStaff: STAFF.length,
  },
  audit: [
    {
      id: "a1",
      timestamp: "[09:14]",
      staffId: "Staff_Kamau",
      action: "initialized diagnostic check on MacBook #409",
      status: "STATUS:MINT",
    },
    {
      id: "a2",
      timestamp: "[09:33]",
      staffId: "Staff_Amina",
      action: "listed ASUS Zephyrus #317 for KSh 185,000",
      status: "STATUS:ONLINE",
    },
    {
      id: "a3",
      timestamp: "[10:02]",
      staffId: "Staff_Brian",
      action: "repaired battery on ThinkPad #411",
      status: "STATUS:REPAIRED",
    },
    {
      id: "a4",
      timestamp: "[10:48]",
      staffId: "Staff_Mary",
      action: "escalated cash-out KSh 45,000 for Dell #302",
      status: "STATUS:PENDING",
    },
    {
      id: "a5",
      timestamp: "[11:21]",
      staffId: "Staff_Kamau",
      action: "wrote quote KSh 72,000 for Lenovo #420 via QuoteEngine",
      status: "STATUS:QUOTED",
    },
    {
      id: "a6",
      timestamp: "[11:58]",
      staffId: "Staff_Amina",
      action: "archived MacBook #401 condition COOKED",
      status: "STATUS:ARCHIVED",
    },
  ],
  pending: [
    {
      id: "p1",
      staffId: "Staff_Mary",
      staffName: "Mary",
      laptopId: "#302-Dell-XPS",
      amountKsh: 45000,
      reason: "Manager override — customer pickup, no card terminal",
      requestedAt: "[10:48]",
      role: "manager",
    },
    {
      id: "p2",
      staffId: "Staff_Amina",
      staffName: "Amina",
      laptopId: "#317-ASUS-G14",
      amountKsh: 38000,
      reason: "Walk-in buyer, insists on cash settlement",
      requestedAt: "[13:12]",
      role: "manager",
    },
  ],
  seq: 1000,
};

function nowHHMM(): string {
  const d = new Date(Date.now() + 3 * 3600 * 1000); // EAT
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `[${hh}:${mm}]`;
}

function nextId(prefix: string): string {
  store.seq += 1;
  return `${prefix}-${store.seq}`;
}

/** Shallow snapshot for SSR/serialisation. */
export function getDashboardData(): DashboardData {
  return {
    metrics: { ...store.metrics },
    audit: store.audit.map((a) => ({ ...a })),
    pending: store.pending.map((p) => ({ ...p })),
  };
}

export function approvePayout(id: string, approver: string): PendingPayout | null {
  const i = store.pending.findIndex((p) => p.id === id);
  if (i === -1) return null;
  const payout = store.pending.splice(i, 1)[0];
  store.metrics.cashOutlaysKsh += payout.amountKsh;
  store.metrics.netProfitMarginKsh =
    store.metrics.totalRevenueKsh - store.metrics.cashOutlaysKsh;
  store.audit.push({
    id: nextId("a"),
    timestamp: nowHHMM(),
    staffId: approver,
    action: `approved remote cash payout of KSh ${payout.amountKsh.toLocaleString("en-KE")} for ${payout.laptopId}`,
    status: "STATUS:APPROVED",
  });
  return { ...payout };
}

export function terminatePayout(id: string, terminator: string): PendingPayout | null {
  const i = store.pending.findIndex((p) => p.id === id);
  if (i === -1) return null;
  const payout = store.pending.splice(i, 1)[0];
  store.audit.push({
    id: nextId("a"),
    timestamp: nowHHMM(),
    staffId: terminator,
    action: `terminated cash payout request of KSh ${payout.amountKsh.toLocaleString("en-KE")} for ${payout.laptopId}`,
    status: "STATUS:TERMINATED",
  });
  return { ...payout };
}
