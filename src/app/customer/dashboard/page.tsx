/**
 * Device Lab 254 — Customer Vault Viewport
 *
 * Secure personal dashboard for community clients.
 * Features:
 * 1. My Hardware Collection Ledger (bought laptops + active trade-in offers)
 * 2. Live Service Voucher Tracker (repair status)
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { LaptopStatus, TransactionStatus, TransactionType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function money(v: number): string {
  return `KSh ${v.toLocaleString("en-KE")}`;
}

const PROGRESS_STEPS = [
  "[ STEP 01: HARDWARE DIAGNOSTICS ]",
  "[ STEP 02: REPAIR IN PROGRESS ]",
  "[ STEP 03: CALIBRATION PASSED // READY FOR NAIROBI HQ PICKUP ]",
];

async function getCustomerData() {
  const [purchasedLaptops, tradeInOffers, repairTickets] = await Promise.all([
    db.laptop.findMany({
      where: { status: LaptopStatus.SOLD },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    db.transaction.findMany({
      where: {
        type: TransactionType.CASH_OUT_TRADEIN,
        status: TransactionStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.transaction.findMany({
      where: {
        status: TransactionStatus.PENDING,
        OR: [
          { type: TransactionType.CASH_IN_SALE },
          { type: TransactionType.CASH_OUT_TRADEIN },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return { purchasedLaptops, tradeInOffers, repairTickets };
}

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }

  const { purchasedLaptops, tradeInOffers, repairTickets } = await getCustomerData();

  return (
    <main className="min-h-screen w-full bg-canvas font-mono text-text">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/60 px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs tracking-widest text-text-dim sm:text-sm">
              [ DEVICE LAB 254 :: CUSTOMER VAULT ]
            </span>
            <span className="hidden text-xs text-text-dim sm:inline">
              client: <span className="text-text">{session.user?.email}</span>
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
        {/* ── Section 1: Hardware Collection Ledger ── */}
        <section aria-labelledby="ledger-heading">
          <h2
            id="ledger-heading"
            className="mb-4 text-xs font-medium uppercase tracking-wider text-text-dim"
          >
            My Hardware Collection Ledger
          </h2>

          {/* Purchased Laptops */}
          <div className="mb-6">
            <h3 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-neon">
              Purchased Devices
            </h3>
            {purchasedLaptops.length === 0 ? (
              <p className="text-xs text-text-dim">no purchases yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {purchasedLaptops.map((lap) => (
                  <div
                    key={lap.id}
                    className="rounded-xl border border-border bg-card/60 p-3 shadow-inner"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs text-text-dim">
                        {lap.brand} {lap.model}
                      </span>
                      <span className="text-xs text-text-dim">
                        RCPT: DL254-{lap.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-dim">
                      {lap.processor} · {lap.ram} GB · {lap.storage} GB SSD
                    </p>
                    <p className="mt-1 text-xs text-text-dim">
                      Purchased: {lap.updatedAt.toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-xs text-warning">
                      Warranty: 12 months remaining
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Trade-In Offers */}
          <div>
            <h3 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-warning">
              My Active Trade-In Offers
            </h3>
            {tradeInOffers.length === 0 ? (
              <p className="text-xs text-text-dim">no active offers.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {tradeInOffers.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-border bg-card/60 p-3 shadow-inner"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs text-text-dim">
                        Offer #{tx.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-xs text-text-dim">
                        {tx.createdAt.toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-neon">
                      {money(tx.amount)}
                    </p>
                    <p className="text-xs text-text-dim">
                      Status: {tx.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Section 2: Live Service Voucher Tracker ── */}
        <section aria-labelledby="voucher-heading">
          <h2
            id="voucher-heading"
            className="mb-4 text-xs font-medium uppercase tracking-wider text-text-dim"
          >
            Live Service Voucher Tracker
          </h2>

          {repairTickets.length === 0 ? (
            <p className="text-xs text-text-dim">no active service tickets.</p>
          ) : (
            <div className="space-y-4">
              {repairTickets.map((tx, idx) => {
                const progressIdx = Math.min(
                  idx % PROGRESS_STEPS.length,
                  PROGRESS_STEPS.length - 1,
                );

                return (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-border bg-card/60 p-4 shadow-inner"
                  >
                    <div className="flex justify-between mb-3">
                      <span className="text-xs text-text-dim">
                        Ticket #{tx.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold ${
                        tx.status === TransactionStatus.SUCCESS
                          ? "text-neon"
                          : tx.status === TransactionStatus.FAILED
                          ? "text-danger"
                          : "text-warning"
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {PROGRESS_STEPS.map((step, i) => (
                        <>
                          <span
                            key={i}
                             className={`text-[10px] font-mono ${
                               i <= progressIdx ? "text-neon" : "text-text-dim"
                             }`}>
                            {step}
                          </span>
                          {i < PROGRESS_STEPS.length - 1 && (
                            <span className="text-text-dim">➔</span>
                          )}
                        </>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
