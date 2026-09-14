import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  BRAND_BASE_KSH,
  COOKED_THRESHOLD,
  MIN_YEAR_FACTOR,
  PROCESSOR_TIER,
  RAM_BONUS_PER_8GB,
  STORAGE_BONUS_PER_256GB,
  YEAR_DEPRECATION_RATE,
} from "@/lib/config";

export interface QuoteRequest {
  brand: string;
  model: string;
  year: number;
  processor: string;
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

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Valuation parameters are centralized in `@/lib/config` so the payout
 * matrix can be retuned without touching business logic.
 *   value = (brandBase * processorTier + ramBoost + storageBoost)
 *           * yearFactor * conditionMultiplier
 * "Cooked" devices (condition <= COOKED_THRESHOLD) are sharply deducted —
 * the condition multiplier never exceeds 0.5 in the cooked band.
 */
function calculateQuote(req: QuoteRequest): QuoteResponse {
  const breakdown: QuoteBreakdown[] = [];

  const base = BRAND_BASE_KSH[req.brand] ?? BRAND_BASE_KSH["Dell"]!;
  breakdown.push({ label: "Brand baseline", amount: base });

  const tier = PROCESSOR_TIER[req.processor] ?? 0.9;
  const tiered = Math.round(base * tier);
  breakdown.push({ label: "Processor tier", amount: tiered - base });

  const ramSteps = Math.max(0, Math.floor((req.ramGB - 8) / 8));
  const ramBoost = ramSteps * RAM_BONUS_PER_8GB;
  if (ramBoost) breakdown.push({ label: `RAM (${req.ramGB} GB)`, amount: ramBoost });

  const storageSteps = Math.max(0, Math.floor((req.storageGB - 256) / 256));
  const storageBoost = storageSteps * STORAGE_BONUS_PER_256GB;
  if (storageBoost) breakdown.push({ label: `Storage (${req.storageGB} GB)`, amount: storageBoost });

  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - req.year);
  const yearFactor = age === 0 ? 1 : Math.max(0.2, 1 - age * YEAR_DEPRECATION_RATE);
  const yearDeduction = Math.round((1 - yearFactor) * 100);
  breakdown.push({
    label: `Depreciation (${age}yr old, -${yearDeduction}%)`,
    amount: 0,
  });

  let subtotal = tiered + ramBoost + storageBoost;
  subtotal = Math.round(subtotal * yearFactor);
  breakdown.push({ label: "Subtotal (pre-condition)", amount: subtotal });

  const ratio = clamp(req.condition, 0, 100) / 100;
  const cooked = ratio <= COOKED_THRESHOLD;
  // Cooked band ramps 0%→0.5; above it ramps 0.5→1.0 (smooth, flat 50% at the cooked border).
  const conditionMultiplier =
    ratio <= COOKED_THRESHOLD
      ? (ratio / COOKED_THRESHOLD) * 0.5
      : 0.5 + 0.5 * ((ratio - COOKED_THRESHOLD) / (1 - COOKED_THRESHOLD));
  breakdown.push({
    label: `Condition (${cooked ? "COOKED" : "OK"}) x${conditionMultiplier.toFixed(2)}`,
    amount: 0,
  });

  const value = Math.max(Math.round(subtotal * conditionMultiplier), 0);
  breakdown.push({ label: "TOTAL PAYOUT", amount: value });

  const nairobi = new Date(Date.now() + 3 * 3600 * 1000).toISOString();

  return {
    value,
    valueFormatted: `KSh ${value.toLocaleString("en-KE")}`,
    reference: `DL254-${randomUUID().toUpperCase().slice(0, 12)}`,
    timestamp: nairobi,
    cooked,
    breakdown,
  };
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("Request body must be valid JSON.");
  }

  if (typeof body !== "object" || body === null) return bad("Payload must be an object.");

  const b = body as Partial<QuoteRequest>;
  if (!b.brand || typeof b.brand !== "string") return bad("brand is required.");
  if (!b.processor || typeof b.processor !== "string")
    return bad("processor is required.");
  if (typeof b.year !== "number" || b.year < 2000 || b.year > 2100)
    return bad("year must be a valid number.");
  if (typeof b.ramGB !== "number" || b.ramGB <= 0) return bad("ramGB must be positive.");
  if (typeof b.storageGB !== "number" || b.storageGB <= 0)
    return bad("storageGB must be positive.");
  if (typeof b.condition !== "number" || b.condition < 0 || b.condition > 100)
    return bad("condition must be 0–100.");

  const quote = calculateQuote({
    brand: b.brand,
    model: b.model ?? "",
    year: b.year,
    processor: b.processor,
    ramGB: b.ramGB,
    storageGB: b.storageGB,
    condition: b.condition,
  });

  return NextResponse.json(quote, { status: 200 });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, name: "Device Lab 254 Valuation Engine", version: "2.54" },
    { status: 200 },
  );
}
