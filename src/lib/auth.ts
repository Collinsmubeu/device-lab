import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type UserRole = "OWNER" | "WORKER" | "CUSTOMER";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number; // epoch seconds
}

export const SESSION_COOKIE = "dl254_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

/** Dev-only credentials. Production should gate behind a real identity provider. */
export const DEV_ADMIN = {
  email: "owner@device254.dev",
  password: "lab254-rock",
};

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV !== "production") {
    return "dev-insecure-secret-replace-in-prod";
  }
  throw new Error("SESSION_SECRET is not configured.");
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function unb64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function sign(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verify(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(unb64url(body)) as SessionPayload;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifySession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verify(store.get(SESSION_COOKIE)?.value);
}

export function getSessionFromRequest(
  token: string | undefined,
): SessionPayload | null {
  return verify(token);
}

export function createSessionCookie(userId: string, email: string, role: UserRole) {
  const payload: SessionPayload = {
    userId,
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  return {
    name: SESSION_COOKIE,
    value: sign(payload),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
