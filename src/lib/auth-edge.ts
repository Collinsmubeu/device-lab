/**
 * Edge-Runtime-safe session verification.
 *
 * Middleware runs in the Edge Runtime where `node:crypto` is unavailable.
 * This module duplicates just the HMAC verification logic using the Web
 * Crypto API so the middleware can validate the `dl254_session` cookie
 * without pulling in the full `auth.ts` (which imports `next/headers` and
 * `node:crypto`).
 */

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function b64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
  return atob(padded + pad);
}

async function verifyWithSecret(
  body: string,
  sig: string,
  secret: string,
): Promise<SessionPayload | null> {
  const expected = await hmacSha256(secret, body);
  if (!safeEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
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

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return verifyWithSecret(body, sig, "dev-insecure-secret-replace-in-prod");
    }
    return null;
  }

  return verifyWithSecret(body, sig, secret);
}

export async function resolveSessionFromCookie(
  cookie: string | undefined,
): Promise<SessionPayload | null> {
  return verifySessionToken(cookie);
}
