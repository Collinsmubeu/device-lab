import { PrismaClient } from "@prisma/client";

/**
 * Device Lab 254 — Prisma singleton.
 *
 * In dev, `globalThis.prisma` is reused across Hot Module Reloads so we never
 * exhaust the Postgres connection pool during `next dev`. In production a
 * single module-level instance is enough (the serverless runtime recycles it
 * per invocation anyway).
 */
const globalWithPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalWithPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    // Fail fast and safely if the database layer is unreachable — never leak
    // stack traces to the client (callers handle errors via try/catch).
    errorRecovery: {
      // @ts-expect-error Prisma 6+ option; ignored by older typings.
      timeout: 10_000,
      // Retry transient connection errors once.
      maxAttempts: 2,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalWithPrisma.prisma = prisma;
}

export default prisma;
