"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  BRANDS,
  CURRENT_YEAR,
  PROCESSORS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  YEARS,
  type Processor,
} from "@/lib/config";

export interface QuotePayload {
  brand: string;
  model: string;
  year: number;
  processor: Processor | "";
  ramGB: number;
  storageGB: number;
  condition: number; // 0–100
}

export interface QuoteBreakdown {
  label: string;
  amount: number;
}

export interface QuoteResponse {
  value: number;
  valueFormatted: string;
  reference: string;
  timestamp: string;
  cooked: boolean;
  breakdown: QuoteBreakdown[];
}

function PillSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <div className="flex flex-column gap-1.5">
      <span className="text-[11px] font-medium text-text-dim uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() =>
                onChange(active && value === opt ? "" : opt as T)
              }
              className={`rounded border px-3 py-1.5 text-[12px] font-mono font-medium transition-all ${
                active
                  ? "border-neon bg-neon/10 text-neon shadow-[0_0_10px_theme(colors.neon)]"
                  : "border-border text-text-dim hover:border-neon hover:text-neon"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConditionSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const commit = (clientX: number) => {
    const t = trackRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onChangeRef.current(Math.round(pct * 100));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    commit(e.clientX);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const t = trackRef.current;
      if (!t) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = t.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        onChangeRef.current(Math.round(pct * 100));
      });
    };
    const up = () => {
      draggingRef.current = false;
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") onChange(Math.min(100, value + 5));
    else if (e.key === "ArrowLeft") onChange(Math.max(0, value - 5));
  };

  return (
    <div className="w-full">
      <div
        ref={trackRef}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Condition health (0 = cooked, 100 = flawless)"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="relative h-8 w-full cursor-pointer touch-none select-none"
      >
        <span className="absolute top-1/2 -translate-y-1/2 h-2 w-full rounded-full bg-border/60" />
        <span
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-neon transition-[width]"
          style={{ width: `${value}%` }}
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-neon bg-canvas shadow-[0_0_12px_theme(colors.neon)]"
          style={{ left: `${value}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-mono text-text-dim">
        <span>FULLY COOKED / DEAD</span>
        <span>FLAWLESS / VAULT TIER</span>
      </div>
      <div className="mt-1 text-center text-[11px] font-mono text-text-dim">
        {value < 30 ? (
          <span className="text-danger">COOKED</span>
        ) : value < 70 ? (
          <span className="text-warning">SALVAGEABLE</span>
        ) : (
          <span className="text-neon">VAULT TIER</span>
        )}{" "}
        — {value}%
      </div>
    </div>
  );
}

function useBarcode(seed: string): number[] {
  return useMemo(() => {
    const n = 34;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      h = ((h * 1103515245 + 12345) & 0x7fffffff) >>> 0;
      out.push(30 + (h % 70));
    }
    return out;
  }, [seed]);
}

function Barcode({ seed }: { seed: string }) {
  const bars = useBarcode(seed);
  return (
    <div className="flex items-end justify-center gap-[3px] h-20 w-full">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] bg-text"
          style={{ height: `${h}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TerminalLoading({ payload }: { payload: QuotePayload }) {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const full = [
      "> boot: device_lab_valuation_engine v2.54 // nairobi node",
      "> handshake... OK",
      `> brand            = ${payload.brand || "(none)"}`,
      `> model            = ${payload.model || "(none)"}`,
      `> year             = ${payload.year || "(none)"}`,
      `> processor        = ${payload.processor || "(none)"}`,
      `> ram              = ${payload.ramGB} GB`,
      `> storage          = ${payload.storageGB} GB`,
      `> condition        = ${payload.condition}%`,
      "> validating... OK",
      "> STAGE 1/3 :: baseline ...",
      "> STAGE 2/3 :: premium uplift ...",
      "> STAGE 3/3 :: condition decay ...",
      "> computing... ████████",
    ];
    let i = 0;
    const iv = setInterval(() => {
      setLines((l) => (l.length < full.length ? [...l, full[i]] : l));
      i += 1;
      if (i >= full.length) clearInterval(iv);
    }, 90);
    return () => clearInterval(iv);
  }, [payload]);

  return (
    <div
      className="relative w-full max-w-2xl rounded-xl border border-border bg-card-2 p-5 font-mono text-xs text-text-dim"
      aria-label="valuation in progress"
    >
        <span className="mb-2 block text-[10px] uppercase tracking-wider text-text-dim">
          {"// live valuation feed"}
        </span>
      <div className="space-y-1">
        {lines.map((l, i) => (
          <div
            key={i}
            className="opacity-0 animate-in fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {l}
          </div>
        ))}
      </div>
      <span className="absolute right-4 top-3 h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_8px_theme(colors.neon)] animate-pulse" />
    </div>
  );
}

export default function QuoteEngine() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [payload, setPayload] = useState<QuotePayload>({
    brand: "",
    model: "",
    year: CURRENT_YEAR,
    processor: "",
    ramGB: 16,
    storageGB: 512,
    condition: 75,
  });
  const [phase, setPhase] = useState<"input" | "loading" | "result" | "error">(
    "input",
  );
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState("");
  const [mpesa, setMpesa] = useState(false);

  const update = (p: Partial<QuotePayload>) =>
    setPayload((prev) => ({ ...prev, ...p }));

  const canProceedStep1 = payload.brand && payload.year;
  const canProceedStep2 =
    payload.brand && payload.year && payload.processor && payload.ramGB && payload.storageGB;
  const canSubmit = canProceedStep2 && payload.condition !== undefined;
  const handleAssess = async () => {
    if (!canSubmit) return;
    setPhase("loading");
    setError("");
    setQuote(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Valuation engine glitched.");
      setQuote(data as QuoteResponse);
      setPhase("result");
    } catch (e) {
      setError((e as Error).message);
      setPhase("error");
    }
  };

  const handleMpesa = () => setMpesa(true);

  const STEPS = [1, 2, 3] as const;
  const stepLabel = (step: number) => {
    const labels = {
      1: "CORE BRAND & YEAR",
      2: "SPEC CONFIG",
      3: "CONDITION EVAL",
    };
    return labels[step as 1 | 2 | 3];
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <nav
        aria-label="quote steps"
        className="mb-6 flex items-center gap-2 text-[11px] font-mono uppercase"
      >
        {STEPS.map((s) => (
          <span
            key={s}
            className={`flex items-center gap-1 ${
              s === step ? "text-neon" : "text-text-dim"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded border text-[9px] ${
                s === step
                  ? "border-neon text-neon"
                  : "border-border text-text-dim"
              }`}
            >
              {s}
            </span>
            <span className="hidden sm:inline">{stepLabel(s)}</span>
            {s < 3 && (
              <span className="mx-1 h-px w-4 bg-border sm:w-6" />
            )}
          </span>
        ))}
      </nav>

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-medium text-text-dim uppercase tracking-wider">
            Step 1 — {stepLabel(1)}
          </h2>
          <PillSelect
            label="Brand"
            options={BRANDS}
            value={payload.brand}
            onChange={(v) => update({ brand: v })}
          />
          <PillSelect
            label="Release Year"
            options={YEARS.map(String)}
            value={String(payload.year)}
            onChange={(v) => update({ year: Number(v) })}
          />
          <div>
            <label className="mb-1 block text-[11px] font-medium text-text-dim uppercase tracking-wider">
              Model
            </label>
            <input
              type="text"
              value={payload.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder="e.g. ThinkPad X1 Carbon Gen 12"
              className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-neon outline-none"
            />
          </div>
          <button
            type="button"
            disabled={!canProceedStep1}
            onClick={() => canProceedStep1 && setStep(2)}
            className="w-full rounded border border-neon bg-neon/10 py-2 text-[12px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            [ NEXT ]
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-medium text-text-dim uppercase tracking-wider">
            Step 2 — {stepLabel(2)}
          </h2>
          <PillSelect
            label="Processor"
            options={PROCESSORS}
            value={payload.processor}
            onChange={(v) => update({ processor: v })}
          />
          <PillSelect
            label="RAM"
            options={RAM_OPTIONS.map((r) => `${r} GB`) as string[]}
            value={`${payload.ramGB} GB`}
            onChange={(v) => update({ ramGB: Number(v) })}
          />
          <PillSelect
            label="Storage"
            options={STORAGE_OPTIONS.map((s) => `${s} GB`) as string[]}
            value={`${payload.storageGB} GB`}
            onChange={(v) => update({ storageGB: Number(v) })}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/2 rounded border border-border bg-card py-2 text-[12px] font-mono font-bold uppercase tracking-wider text-text-dim transition hover:border-neon hover:text-neon"
            >
              [ BACK ]
            </button>
            <button
              type="button"
              disabled={!canProceedStep2}
              onClick={() => canProceedStep2 && setStep(3)}
              className="w-1/2 rounded border border-neon bg-neon/10 py-2 text-[12px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              [ NEXT ]
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-medium text-text-dim uppercase tracking-wider">
            Step 3 — {stepLabel(3)}
          </h2>
          <p className="text-[11px] text-text-dim">
            Assess your rig&rsquo;s health. Drag left = cooked/dead, right = flawless.
          </p>

          {phase === "input" && (
            <>
              <ConditionSlider
                value={payload.condition}
                onChange={(v) => update({ condition: v })}
              />
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleAssess}
                className="w-full rounded border border-neon bg-neon/10 py-3 text-[13px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                [ RUN THE NUMBERS ]
              </button>
            </>
          )}

          {phase === "loading" && <TerminalLoading payload={payload} />}

          {phase === "error" && (
            <div className="rounded border border-danger bg-card p-4 font-mono text-xs text-danger">
              <span className="font-bold">&gt; </span>
              {error || "valuation engine tripped — retry."}
            </div>
          )}

          {phase === "result" && quote && (
            <Certificate quote={quote} mpesa={mpesa} onMpesa={handleMpesa} />
          )}

          {phase !== "loading" && phase !== "result" && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-[11px] font-mono text-text-dim underline underline-offset-2 hover:text-neon"
            >
              [ BACK TO SPECS ]
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Certificate({
  quote,
  mpesa,
  onMpesa,
}: {
  quote: QuoteResponse;
  mpesa: boolean;
  onMpesa: () => void;
}) {
  const cookedLabel = quote.cooked
    ? "⚠️  cooked-tier valuation applied (-50%)"
    : "full market-tier valuation";
  return (
    <div className="relative w-full rounded-xl border-2 border-neon/40 bg-gradient-to-b from-card to-card-2 p-6 font-mono">
      <span className="absolute -top-px left-0 right-0 h-px bg-neon/30" />
      <header className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-text-dim">
          VALUATION CERTIFICATE
        </span>
        <span className="text-[10px] text-text-dim">REF: {quote.reference}</span>
      </header>

      <div className="my-4 text-center text-3xl font-bold text-neon">
        {quote.valueFormatted}
      </div>
      <p className="text-center text-[11px] text-text-dim">{cookedLabel}</p>

      {/* ASCII barcode */}
      <div className="my-5 flex flex-col items-center gap-2">
        <Barcode seed={quote.reference} />
        <span className="text-[11px] text-text-dim">{quote.reference}</span>
      </div>

      {/* Breakdown */}
      <dl className="mt-2 space-y-1 border-t border-border pt-3 text-[11px]">
        {quote.breakdown.map((b) => (
          <div
            key={b.label}
            className="flex justify-between text-text-dim"
          >
            <span>{b.label}</span>
            <span>{b.amount >= 0 ? `+ KSh ${b.amount.toLocaleString("en-KE")}` : `- KSh ${Math.abs(b.amount).toLocaleString("en-KE")}`}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-1 font-bold text-text">
          <span>TOTAL PAYOUT</span>
          <span>{quote.valueFormatted}</span>
        </div>
      </dl>

      <p className="mt-3 text-[10px] text-text-dim">
        stamped: {quote.timestamp}
      </p>

      <footer className="mt-5">
        {mpesa ? (
          <div className="rounded border border-neon bg-neon/10 py-3 text-center text-sm font-bold text-neon">
            &gt; m-pesa prompt dispatched to your SIM. check phone.
          </div>
        ) : (
          <button
            type="button"
            onClick={onMpesa}
            className="w-full rounded border border-neon bg-neon/10 py-3 text-[13px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
          >
            [ LOCK IN CASHOUT VIA M-PESA ]
          </button>
        )}
      </footer>
    </div>
  );
}
