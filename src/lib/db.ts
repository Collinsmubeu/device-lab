import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Device Lab 254 — Prisma singleton.
 *
 * Prisma v7 connects via a driver adapter (no native engines). In dev,
 * `globalThis.__prisma` is reused across Hot Module Reloads so we never
 * exhaust the Postgres connection pool during `next dev`. In production a
 * single module-level instance is enough (the serverless runtime recycles it
 * per invocation anyway). Errors are never leaked to the client; callers
 * wrap reads in try/catch and surface only a sanitized message.
 */

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
    log: ["error", "warn"],
  });
}

const client = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = client;
}

export const db = client;
export default db;
export { PrismaClient };
export * from "@prisma/client";
