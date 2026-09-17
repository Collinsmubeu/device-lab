"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "signin" | "register";
type Role = "OWNER" | "WORKER" | "CUSTOMER";

interface AuthResponse {
  message: string;
  role?: Role;
  email?: string;
}

const ROLE_ROUTES: Record<Role, string> = {
  OWNER: "/admin/dashboard",
  WORKER: "/staff/dashboard",
  CUSTOMER: "/customer/dashboard",
};

export default function SigninForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "register" ? "register" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback("[ SYS_VERIFYING // ACCESSING PORTAL_PERMISSIONS... ]");

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const payload = { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await res.json();

      if (res.ok) {
        setFeedback(data.message);

        if (mode === "signin" && data.role) {
          const route = ROLE_ROUTES[data.role];
          setTimeout(() => {
            router.push(route);
          }, 800);
        }
      } else {
        setFeedback(data.message || "[ ERROR // UNKNOWN_RESPONSE ]");
      }
    } catch {
      setFeedback("[ ERROR // NETWORK_FAILURE ]");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas font-mono">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-[0.3em] text-text">
            D V C L B // AUTH_GATE_254
          </h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-t-xl border-b-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider ${
              mode === "signin"
                ? "border-neon text-neon"
                : "border-border text-text-dim"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-t-xl border-b-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider ${
              mode === "register"
                ? "border-neon text-neon"
                : "border-border text-text-dim"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text-dim">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded border-2 border-border bg-card px-3 py-2 text-sm text-text font-mono placeholder:text-text-dim focus:border-neon focus:outline-none"
              placeholder="owner@device254.dev"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text-dim">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded border-2 border-border bg-card px-3 py-2 text-sm text-text font-mono placeholder:text-text-dim focus:border-neon focus:outline-none"
              placeholder="••••••"
              required
            />
          </div>

          {mode === "register" && (
            <p className="rounded border border-border bg-card px-3 py-2 text-[10px] font-mono text-text-dim">
              [ ROLE_ASSIGNMENT // SERVER_LOCKED :: cmubeu@gmail.com → OWNER, all
              other sign-ups → CUSTOMER ]
            </p>
          )}

          {isSubmitting && (
            <div className="rounded border border-neon bg-neon/10 px-3 py-2 text-[11px] font-mono text-neon">
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full rounded border border-neon bg-neon/10 py-3 text-[13px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "signin"
              ? "[ INITIALIZE_SESSION ]"
              : "[ REGISTER_NEW_CORE_PROFILE ]"}
          </button>
        </form>

        {feedback && !isSubmitting && (
          <div
            className={`rounded border px-3 py-2 text-[11px] font-mono ${
              feedback.includes("SUCCESS") || feedback.includes("GRANTED")
                ? "border-neon bg-neon/10 text-neon"
                : "border-danger bg-danger/10 text-danger"
            }`}
          >
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}