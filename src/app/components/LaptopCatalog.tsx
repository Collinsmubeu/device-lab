"use client";

import { useState } from "react";

export interface LaptopSpec {
  ramGB: number;
  storageGB: number;
  processor: string;
  gpu: string;
}

export type ConditionGrade = "VAULT-CONDITION" | "MINT" | "GOOD" | "COOKED - FOR PARTS";
export type CoreTier = "[DEV_RIG]" | "[CREATOR]" | "[MAX_GAMING]" | "[GAMER]";

export interface Laptop {
  id: string;
  brand: string;
  model: string;
  color: string;
  specs: LaptopSpec;
  batteryCycleCount: number;
  conditionHealth: number;
  conditionGrade: ConditionGrade;
  coreTier: CoreTier;
  priceKsh: number;
  inStock: boolean;
  description: string;
}

const LAPTOPS: Laptop[] = [
  {
    id: "mbp-16-m3max",
    brand: "Apple",
    model: "MacBook Pro 16\"",
    color: "Space Black",
    specs: {
      ramGB: 36,
      storageGB: 1024,
      processor: "Apple M3 Max",
      gpu: "40-core GPU",
    },
    batteryCycleCount: 14,
    conditionHealth: 95,
    conditionGrade: "VAULT-CONDITION",
    coreTier: "[MAX_GAMING]",
    priceKsh: 340000,
    inStock: true,
    description: "16\" Liquid Retina XDR, M3 Max, 36GB unified, 1TB SSD, Space Black.",
  },
  {
    id: "asus-g14-rog",
    brand: "ASUS",
    model: "ROG Zephyrus G14",
    color: "Midnight Gray",
    specs: {
      ramGB: 32,
      storageGB: 1024,
      processor: "AMD Ryzen 9 7940HS",
      gpu: "NVIDIA RTX 4070",
    },
    batteryCycleCount: 0,
    conditionHealth: 88,
    conditionGrade: "MINT",
    coreTier: "[MAX_GAMING]",
    priceKsh: 210000,
    inStock: true,
    description: "QHD+ 240Hz, Ryzen 9, RTX 4070, 32GB, 1TB SSD.",
  },
  {
    id: "lenovo-x1-dev",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Dev Edition",
    color: "Matte Black",
    specs: {
      ramGB: 16,
      storageGB: 512,
      processor: "Intel Core i7-1365U",
      gpu: "Intel Iris Xe",
    },
    batteryCycleCount: 85,
    conditionHealth: 72,
    conditionGrade: "GOOD",
    coreTier: "[DEV_RIG]",
    priceKsh: 95000,
    inStock: true,
    description: "14\" 4K, i7, 16GB LPDDR5, 512GB SSD, 120Whr battery.",
  },
  {
    id: "hp-victus-15",
    brand: "HP",
    model: "Victus 15",
    color: "Chipped chassis",
    specs: {
      ramGB: 8,
      storageGB: 512,
      processor: "Intel Core i5-12500H",
      gpu: "NVIDIA GTX 1650",
    },
    batteryCycleCount: 120,
    conditionHealth: 25,
    conditionGrade: "COOKED - FOR PARTS",
    coreTier: "[GAMER]",
    priceKsh: 55000,
    inStock: false,
    description: "15.6\" FHD, i5, GTX 1650, 8GB, 512GB SSD. Parts unit — cosmetic wear.",
  },
];

function formatKsh(value: number): string {
  return `KSh ${value.toLocaleString("en-KE")}`;
}

const GRADE_TONE: Record<ConditionGrade, string> = {
  "VAULT-CONDITION": "text-neon",
  MINT: "text-warning",
  GOOD: "text-warning",
  "COOKED - FOR PARTS": "text-danger",
};

function DeviceSilhouette({ brand }: { brand: string }) {
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
        className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full
          ${
            brand === "Apple"
              ? "bg-neon"
              : brand === "ASUS"
              ? "bg-neon"
              : brand === "Lenovo"
              ? "bg-warning"
              : "bg-danger"
          }`}
        aria-label={`brand accent for ${brand}`}
      />
    </div>
  );
}

export default function BentoCatalog() {
  const [focused, setFocused] = useState<string>(LAPTOPS[0].id);

  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr"
      aria-label="Premium laptop stock"
    >
      {LAPTOPS.map((lap, i) => (
        <article
          key={lap.id}
          onMouseEnter={() => setFocused(lap.id)}
          className={`group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-inner transition-all duration-300 ${
            lap.inStock
              ? "hover:border-neon hover:shadow-[0_0_22px_theme(colors.neon)] focus-within:border-neon focus-within:shadow-[0_0_22px_theme(colors.neon)]"
              : "opacity-60"
          } ${i === 0 ? "sm:col-span-2" : ""} ${i === 1 ? "lg:col-span-2" : ""} ${
            i === 2 ? "" : ""
          }`}
        >
          <DeviceSilhouette brand={lap.brand} />

          <header className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs tracking-wider text-text-dim">
                {lap.brand.toUpperCase()}
              </p>
              <h3 className="text-sm font-semibold text-text">{lap.model}</h3>
              <p className="text-xs text-text-dim">{lap.color}</p>
            </div>
            <span
              className={`rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${GRADE_TONE[lap.conditionGrade]}`}
            >
              {lap.conditionGrade}
            </span>
          </header>

          <p className="text-xs text-text-dim">{lap.description}</p>

          <p className="text-xs text-text-dim">
            {lap.coreTier} · {lap.specs.processor} · {lap.specs.gpu} ·{" "}
            {lap.specs.ramGB} GB ·{" "}
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
