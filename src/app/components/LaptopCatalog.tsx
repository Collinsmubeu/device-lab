"use client";

import { useState } from "react";
import inventory from "@/lib/inventory.json";

export interface LaptopSpec {
  ramGB: number;
  storageGB: number;
  processor: string;
}

export type ConditionGrade = "VAULT-CONDITION" | "MINT" | "COOKED - FOR PARTS";
export type CoreTier = "[DEV_RIG]" | "[CREATOR]" | "[MAX_GAMING]";

export interface Laptop {
  id: string;
  brand: string;
  model: string;
  specs: LaptopSpec;
  batteryCycleCount: number;
  conditionHealth: number; // 0–100
  conditionGrade: ConditionGrade;
  coreTier: CoreTier;
  priceKsh: number;
  inStock: boolean;
}

const LAPTOPS: Laptop[] = inventory as unknown as Laptop[];

function formatKsh(value: number): string {
  return `KSh ${value.toLocaleString("en-KE")}`;
}

/** Grade → badge tone mapping. */
const GRADE_TONE: Record<ConditionGrade, string> = {
  "VAULT-CONDITION": "text-neon",
  MINT: "text-warning",
  "COOKED - FOR PARTS": "text-danger",
};

/** Inline device silhouette (no external assets). */
function DeviceSilhouette({ brand }: { brand: string }) {
  // A single accent dot keyed off brand keeps the grid lively without assets.
  const dot: Record<string, string> = {
    Apple: "bg-neon",
    ASUS: "bg-neon",
    Lenovo: "bg-neon",
    Dell: "bg-neon",
  };
  return (
    <div className="relative mb-2">
      <svg
        viewBox="0 0 240 140"
        className="h-24 w-full"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="40" width="200" height="80" rx="10" />
        <rect x="32" y="52" width="176" height="40" rx="6" className="fill-card-2" />
        <circle cx="150" cy="108" r="3" className="fill-text-dim" />
        <circle cx="162" cy="108" r="3" className="fill-text-dim" />
      </svg>
      <span
        className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${dot[brand] ?? "bg-text-dim"}`}
        aria-label={`brand accent for ${brand}`}
      />
    </div>
  );
}

export default function LaptopCatalog() {
  const [focused, setFocused] = useState<string>(LAPTOPS[0].id);

  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr"
      aria-label="Premium laptop stock"
    >
      {LAPTOPS.map((lap) => (
        <article
          key={lap.id}
          onMouseEnter={() => setFocused(lap.id)}
          className={`group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-inner transition-all duration-300 hover:border-neon hover:shadow-[0_0_22px_theme(colors.neon)] focus-within:border-neon focus-within:shadow-[0_0_22px_theme(colors.neon)] ${
            !lap.inStock ? "opacity-60" : ""
          }`}
        >
          <DeviceSilhouette brand={lap.brand} />

          <header className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs tracking-wider text-text-dim">
                {lap.brand.toUpperCase()}
              </p>
              <h3 className="text-sm font-semibold text-text">{lap.model}</h3>
            </div>
            <span
              className={`rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${GRADE_TONE[lap.conditionGrade]}`}
            >
              {lap.conditionGrade}
            </span>
          </header>

          <p className="text-xs text-text-dim">
            {lap.coreTier} · {lap.specs.processor} · {lap.specs.ramGB} GB ·{" "}
            {lap.specs.storageGB} GB SSD
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text">
                {formatKsh(lap.priceKsh)}
              </span>
              <span className="text-xs text-text-dim">
                {lap.batteryCycleCount} cycles · {lap.conditionHealth}% health
              </span>
            </div>
            <button
              type="button"
              disabled={!lap.inStock}
              aria-pressed={focused === lap.id}
              className={`pointer-events-auto rounded border border-border bg-card px-3 py-1.5 text-[11px] font-mono font-medium text-text uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                focused === lap.id
                  ? "border-neon text-neon"
                  : "hover:border-neon hover:text-neon"
              }`}
            >
              {lap.inStock ? "[ SECURE THE GEAR ]" : "[ ARCHIVED / SOLD OUT ]"}
            </button>
          </div>

          {/* Cross-hatch overlay for archived / sold out inventory. */}
          {!lap.inStock && (
            <div
              aria-label="archived / sold out"
              className="pointer-events-none absolute inset-0 rounded-xl"
            >
              <span className="absolute inset-0 -z-10 block h-full w-full rounded-xl bg-[repeating-linear-gradient(45deg,theme(colors.border)_0,theme(colors.border)_2px,theme(colors.text-dim)_2px,theme(colors.text-dim)_4px)] opacity-15" />
              <span className="absolute inset-0 m-auto -translate-y-1/2 rounded-md border border-danger bg-card/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-danger">
                [ ARCHIVED / SOLD OUT ]
              </span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
