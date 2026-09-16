import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { BRAND_BASE_KSH, PROCESSOR_TIER } from "@/lib/config";

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

const CURRENT_YEAR = new Date().getFullYear();
const COOKED_THRESHOLD = 0.3;

function calculateQuote(req: QuoteRequest): QuoteResponse {
  const breakdown: QuoteBreakdown[] = [];

  const base = BRAND_BASE_KSH[req.brand] ?? BRAND_BASE_KSH["Dell"];
  breakdown.push({ label: "Brand baseline", amount: base });

  const tier = PROCESSOR_TIER[req.processor] ?? 0.9;
  const tiered = Math.round(base * tier);
  breakdown.push({ label: "Processor tier modifier", amount: tiered - base });

  const ramBoost = Math.max(0, req.ramGB - 8) * 1500;
  if (ramBoost) breakdown.push({ label: `RAM (${req.ramGB} GB)`, amount: ramBoost });

  const storageSteps = Math.max(0, Math.floor(req.storageGB / 1024));
  const storageBoost = storageSteps * 10000;
  if (storageBoost) breakdown.push({ label: `Storage (${req.storageGB} GB)`, amount: storageBoost });

  const age = Math.max(0, CURRENT_YEAR - req.year);
  const yearFactor = age === 0 ? 1 : Math.max(0.2, 1 - age * 0.1);
  const yearDeduction = Math.round((1 - yearFactor) * 100);
  breakdown.push({
    label: `Year depreciation (-${yearDeduction}% for ${age}yr)`,
    amount: 0,
  });

  let subtotal = tiered + ramBoost + storageBoost;
  subtotal = Math.round(subtotal * yearFactor);
  breakdown.push({ label: "Subtotal (pre-condition)", amount: subtotal });

  const ratio = req.condition / 100;
  const cooked = ratio <= COOKED_THRESHOLD;
  const conditionMultiplier =
    ratio <= COOKED_THRESHOLD
      ? 0.3
      : ratio < 0.5
      ? 0.7
      : ratio < 0.8
      ? 1.0
      : 1.2;

  breakdown.push({
    label: `Condition x${conditionMultiplier.toFixed(2)} (${cooked ? "COOKED" : "OK"})`,
    amount: 0,
  });

  const value = Math.max(Math.round(subtotal * conditionMultiplier), 0);
  breakdown.push({ label: "TOTAL PAYOUT", amount: value });

  const now = new Date(Date.now() + 3 * 3600 * 1000);
  const nairobiISO = now.toISOString();

  return {
    value,
    valueFormatted: `KSh ${value.toLocaleString("en-KE")}`,
    reference: `DL254-${randomUUID().toUpperCase().slice(0, 12)}`,
    timestamp: nairobiISO,
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

  try {
    await db.transaction.create({
      data: {
        amount: quote.value,
        status: TransactionStatus.PENDING,
        type: quote.cooked ? TransactionType.CASH_OUT_TRADEIN : TransactionType.CASH_IN_SALE,
        mpesaReceipt: null,
      },
    });
  } catch (dbError) {
    console.error("[SYS_DB] // Quote logging failed:", dbError);
  }

  return NextResponse.json(quote, { status: 200 });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, name: "Device Lab 254 Valuation Engine", version: "2.54" },
    { status: 200 },
  );
}
