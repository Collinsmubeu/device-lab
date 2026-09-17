/**
 * Device Lab 254 — Worker Intake & Job Board
 *
 * For shop employees and technicians managing physical equipment flow.
 * Features:
 * 1. 5-Point Diagnostic Grading Portal (creates Laptop + AuditLog)
 * 2. Technician Work Order Kanban Board (active repairs / fulfillment)
 */

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ConditionGrade,
  LaptopStatus,
} from "@prisma/client";
import type { Laptop } from "@prisma/client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const BRANDS = ["Apple", "ASUS", "Dell", "HP", "Lenovo", "MSI", "Razer"];

const CONDITION_OPTIONS: { value: ConditionGrade; label: string }[] = [
  { value: "VAULT", label: "VAULT" },
  { value: "MINT", label: "MINT" },
  { value: "GOOD", label: "GOOD" },
  { value: "COOKED", label: "COOKED" },
];

async function getDashboardData(userId: string) {
  const [activeRepairs, fulfillment, audit] = await Promise.all([
    db.laptop.findMany({
      where: {
        status: LaptopStatus.AVAILABLE,
        conditionGrade: { not: ConditionGrade.COOKED },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.laptop.findMany({
      where: { status: LaptopStatus.SOLD },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    db.auditLog.findMany({
      where: { staffId: userId },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
  ]);

  return { activeRepairs, fulfillment, audit };
}

export default async function StaffDashboard() {
  const session = await verifySession();
  if (!session || session.role !== "WORKER") {
    redirect("/signin");
  }

  const data = await getDashboardData(session.userId);

  return (
    <main className="min-h-screen w-full bg-canvas font-mono text-text">
      <header className="border-b border-border bg-card/60 px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs tracking-widest text-text-dim sm:text-sm">
              [ DEVICE LAB 254 :: WORKER INTAKE PORTAL ]
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

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
        {/* ── Section 1: Diagnostic Grading Portal ── */}
        <section
          aria-labelledby="diagnostic-heading"
          className="rounded-xl border border-border bg-card/60 p-5 shadow-inner"
        >
          <h2
            id="diagnostic-heading"
            className="mb-4 text-xs font-medium uppercase tracking-wider text-text-dim"
          >
            5-Point Diagnostic Grading Portal
          </h2>

          <form action={createLaptopAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="staffId" value={session.userId} />

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Brand
              </label>
              <select
                name="brand"
                required
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              >
                <option value="">— select brand —</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Model
              </label>
              <input
                type="text"
                name="model"
                required
                placeholder="e.g. MacBook Pro 16 inch"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono placeholder:text-text-dim focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Processor
              </label>
              <input
                type="text"
                name="processor"
                required
                placeholder="e.g. M3 Max, Ryzen 9 7940HS"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono placeholder:text-text-dim focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                RAM (GB)
              </label>
              <input
                type="number"
                name="ram"
                required
                min="4"
                defaultValue="16"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Storage (GB)
              </label>
              <input
                type="number"
                name="storage"
                required
                min="128"
                defaultValue="512"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Battery Cycles
              </label>
              <input
                type="number"
                name="batteryCycles"
                required
                min="0"
                defaultValue="0"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Health Score (0–100)
              </label>
              <input
                type="number"
                name="healthScore"
                required
                min="0"
                max="100"
                defaultValue="80"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Condition Grade
              </label>
              <select
                name="conditionGrade"
                required
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-dim">
                Price (KSh)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                className="mt-1 w-full rounded border-2 border-border bg-card-2 px-3 py-2 text-sm text-text font-mono focus:border-neon focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded border border-neon bg-neon/10 px-4 py-2 text-[12px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
              >
                [ SUBMIT_DIAGNOSTIC_ENTRY ]
              </button>
            </div>
          </form>
        </section>

        {/* ── Section 2: Kanban Board ── */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Active Hardware Repairs */}
          <section aria-labelledby="repairs-heading">
            <h2
              id="repairs-heading"
              className="mb-3 text-[10px] font-medium uppercase tracking-wider text-warning"
            >
              [ ACTIVE HARDWARE REPAIRS ]
            </h2>
            <div className="space-y-3">
              {data.activeRepairs.length === 0 ? (
                <p className="text-xs text-text-dim">no active repairs.</p>
              ) : (
                data.activeRepairs.map((lap) => (
                  <KanbanCard
                    key={lap.id}
                    laptop={lap}
                    showDispatch={false}
                  />
                ))
              )}
            </div>
          </section>

          {/* Fulfillment Registry */}
          <section aria-labelledby="fulfillment-heading">
            <h2
              id="fulfillment-heading"
              className="mb-3 text-[10px] font-medium uppercase tracking-wider text-neon"
            >
              [ FULFILLMENT REGISTRY ]
            </h2>
            <div className="space-y-3">
              {data.fulfillment.length === 0 ? (
                <p className="text-xs text-text-dim">nothing to fulfill.</p>
              ) : (
                data.fulfillment.map((lap) => (
                  <form key={lap.id} action={dispatchCompleteAction}>
                    <input type="hidden" name="id" value={lap.id} />
                    <KanbanCard laptop={lap} showDispatch={true} />
                  </form>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function KanbanCard({
  laptop,
  showDispatch,
}: {
  laptop: Laptop;
  showDispatch: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-3 shadow-inner">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs text-text-dim">
            {laptop.brand} {laptop.model}
          </p>
          <p className="text-xs text-text-dim">
            {laptop.processor} · {laptop.ram} GB · {laptop.storage} GB SSD
          </p>
          <p className="text-xs text-warning">
            {laptop.batteryCycles} cycles · {laptop.healthScore}% health
          </p>
        </div>
        {showDispatch && (
          <button
            type="submit"
            className="rounded border border-neon bg-neon/10 px-2 py-1 text-[10px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
          >
            [ DISPATCH COMPLETE ]
          </button>
        )}
      </div>
    </div>
  );
}

async function createLaptopAction(formData: FormData) {
  "use server";

  const session = await verifySession();
  if (!session) return;

  const brand = formData.get("brand")?.toString() ?? "";
  const model = formData.get("model")?.toString() ?? "";
  const processor = formData.get("processor")?.toString() ?? "";
  const ram = Number(formData.get("ram"));
  const storage = Number(formData.get("storage"));
  const batteryCycles = Number(formData.get("batteryCycles"));
  const healthScore = Number(formData.get("healthScore"));
  const conditionGrade = formData.get("conditionGrade")?.toString() as ConditionGrade;
  const price = Number(formData.get("price"));

  if (!brand || !model || !conditionGrade) return;

  const laptop = await db.laptop.create({
    data: {
      brand,
      model,
      processor,
      ram,
      storage,
      batteryCycles,
      healthScore,
      conditionGrade,
      price,
      status: LaptopStatus.AVAILABLE,
    },
  });

  await db.auditLog.create({
    data: {
      action: "created_laptop_entry",
      details: `${laptop.brand} ${laptop.model} #${laptop.id.slice(0, 8)}`,
      staffId: session.userId,
    },
  });

  redirect("/staff/dashboard");
}

async function dispatchCompleteAction(formData: FormData) {
  "use server";

  const id = formData.get("id")?.toString() ?? "";
  const session = await verifySession();

  if (!session) return;

  await db.laptop.update({
    where: { id },
    data: { status: LaptopStatus.SOLD },
  });

  await db.auditLog.create({
    data: {
      action: "dispatched_laptop",
      details: `laptop ${id.slice(0, 8)} marked SOLD and dispatched for Nairobi delivery`,
      staffId: session.userId,
    },
  });

  redirect("/staff/dashboard");
}
