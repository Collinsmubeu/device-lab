import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Connectivity probe for the Device Lab 254 PostgreSQL layer.
 *
 * GET /api/test-db — used by the owner dashboard health-check and by
 * `npx prisma studio` boot sequences to confirm the read model is reachable.
 */
export async function GET() {
  try {
    const [laptops, users, transactions] = await Promise.all([
      db.laptop.count(),
      db.user.count(),
      db.transaction.count(),
    ]);

    return NextResponse.json(
      {
        ok: true,
        status: "connected",
        counts: { laptops, users, transactions },
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      { ok: false, status: "disconnected", error: message },
      { status: 500 },
    );
  }
}
