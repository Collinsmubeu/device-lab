"use client";

import { useState, useMemo } from "react";
import type { Laptop } from "@prisma/client";

export type CoreTier = "[DEV_RIG]" | "[CREATOR]" | "[MAX_GAMING]" | "[GAMER]";
export type ConditionGrade = "VAULT-CONDITION" | "MINT" | "GOOD" | "COOKED - FOR PARTS";

interface BentoCatalogProps {
  initialLaptops: Laptop[];
}

function formatKsh(value: number): string {
  return `KSh ${value.toLocaleString("en-KE")}`;
}

const GRADE_TONE: Record<`VAULT` | `MINT` | `GOOD` | `COOKED`, string> = {
  VAULT: "text-neon",
  MINT: "text-warning",
  GOOD: "text-warning",
  COOKED: "text-danger",
};

const GRADE_LABEL: Record<`VAULT` | `MINT` | `GOOD` | `COOKED`, ConditionGrade> = {
  VAULT: "VAULT-CONDITION",
  MINT: "MINT",
  GOOD: "GOOD",
  "COOKED": "COOKED - FOR PARTS",
};

function deriveCoreTier(processor: string): CoreTier {
  const p = processor.toLowerCase();
  if (p.includes("m3") || p.includes("m4") || p.includes("i9") || p.includes("ryzen 9")) {
    return "[MAX_GAMING]";
  }
  if (p.includes("i7") || p.includes("ryzen 7")) {
    return "[CREATOR]";
  }
  if (p.includes("i5") || p.includes("ryzen 5")) {
    return "[DEV_RIG]";
  }
  return "[DEV_RIG]";
}

function DeviceSilhouette({ brand }: { brand: string }) {
  const accent =
    brand === "Apple"
      ? "bg-neon"
      : brand === "ASUS"
      ? "bg-neon"
      : brand === "Lenovo"
      ? "bg-warning"
      : "bg-danger";

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
        className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${accent}`}
        aria-label={`brand accent for ${brand}`}
      />
    </div>
  );
}

const FILTERS: { label: string; value: string }[] = [
  { label: "ALL", value: "ALL" },
  { label: "[ DEV_RIG ]", value: "[DEV_RIG]" },
  { label: "[ CREATOR ]", value: "[CREATOR]" },
  { label: "[ MAX_GAMING ]", value: "[MAX_GAMING]" },
  { label: "[ GAMER ]", value: "[GAMER]" },
];

export default function DynamicBentoCatalog({ initialLaptops }: BentoCatalogProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [focused, setFocused] = useState<string>("");

  const filtered = useMemo(() => {
    return initialLaptops.filter((lap) => {
      if (filter === "ALL") return true;
      const tier = deriveCoreTier(lap.processor);
      return tier === filter;
    });
  }, [initialLaptops, filter]);

  const handleSecure = (id: string) => {
    console.log(`[ SYS_ACTION // SECURE_THE_GEAR ]: ${id}`);
  };

  if (filtered.length === 0 && filter !== "ALL") {
    return (
      <div className="rounded-xl border border-danger bg-card/60 p-6 font-mono text-center text-sm text-danger">
        [ ALERT // ARCHIVE_EMPTY // NO_MATCHES_FOR_FILTER ]
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded border px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-wider transition-all ${
              filter === f.value
                ? "border-neon bg-neon/10 text-neon shadow-[0_0_10px_theme(colors.neon)]"
                : "border-border text-text-dim hover:border-neon hover:text-neon"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bento grid */}
      <div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr"
        aria-label="Active laptop stock"
      >
        {filtered.map((lap, i) => {
          const tier = deriveCoreTier(lap.processor);
          const isSold = lap.status === "SOLD";
          const isAvailable = lap.status === "AVAILABLE";
          const gradeKey = lap.conditionGrade as keyof typeof GRADE_TONE;
          const gradeLabel = GRADE_LABEL[gradeKey];
          const tone = GRADE_TONE[gradeKey] ?? "text-text-dim";

          return (
            <article
              key={lap.id}
              onMouseEnter={() => setFocused(lap.id)}
              onClick={() => isAvailable && handleSecure(lap.id)}
              className={`group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 font-mono shadow-inner transition-all duration-300 ${
                isAvailable
                  ? "cursor-pointer hover:border-neon hover:shadow-[0_0_22px_theme(colors.neon)] focus-within:border-neon focus-within:shadow-[0_0_22px_theme(colors.neon)]"
                  : "opacity-60"
              } ${
                i === 0 ? "sm:col-span-2" : ""
              } ${i === 1 ? "lg:col-span-2" : ""}`}
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
                  className={`rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${tone}`}
                >
                  {gradeLabel}
                </span>
              </header>

              <p className="text-xs text-text-dim">
                {tier} · {lap.processor} · {lap.ram} GB · {lap.storage} GB SSD
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text">
                    {formatKsh(lap.price)}
                  </span>
                  <span className="text-xs text-text-dim">
                    {lap.batteryCycles} cycles · {lap.healthScore}% health
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!isAvailable}
                  aria-pressed={focused === lap.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAvailable) handleSecure(lap.id);
                  }}
                  className={`rounded border border-border bg-card px-3 py-1.5 text-[11px] font-mono font-bold text-text uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    focused === lap.id
                      ? "border-neon text-neon"
                      : "hover:border-neon hover:text-neon"
                  }`}
                >
                  {isAvailable ? "[ SECURE THE GEAR ]" : "[ ARCHIVED / SOLD OUT ]"}
                </button>
              </div>

              {(isSold || !isAvailable) && (
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
          );
        })}
      </div>
    </div>
  );
}
