"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

type AuthMode = "signin" | "register";
type Role = "OWNER" | "WORKER" | "CUSTOMER";

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
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback("[ SYS_VERIFYING // ACCESSING PORTAL_PERMISSIONS... ]");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setFeedback("[ AUTHENTICATION_FAILED // INVALID_CREDENTIALS ]");
      } else {
        setFeedback("[ SESSION_INITIALIZED // ACCESS_GRANTED ]");
        const role: Role = email.toLowerCase() === "cmubeu@gmail.com" ? "OWNER" : "CUSTOMER";
        const route = ROLE_ROUTES[role];
        setTimeout(() => {
          router.push(route);
        }, 800);
      }
    } catch {
      setFeedback("[ ERROR // NETWORK_FAILURE ]");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setFeedback("[ REDIRECTING // GOOGLE_OAUTH... ]");
    await signIn("google", { callbackUrl: "/" });
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
              disabled={isSubmitting || isGoogleSubmitting}
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
              disabled={isSubmitting || isGoogleSubmitting}
              className="mt-1 w-full rounded border-2 border-border bg-card px-3 py-2 text-sm text-text font-mono placeholder:text-text-dim focus:border-neon focus:outline-none"
              placeholder="••••••"
              required
            />
          </div>

          {isSubmitting && (
            <div className="rounded border border-neon bg-neon/10 px-3 py-2 text-[11px] font-mono text-neon">
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting || !email || !password}
            className="w-full rounded border border-neon bg-neon/10 py-3 text-[13px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "signin"
              ? "[ INITIALIZE_SESSION ]"
              : "[ REGISTER_NEW_CORE_PROFILE ]"}
          </button>
        </form>

        {feedback && !isSubmitting && !isGoogleSubmitting && (
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

        {/* Divider */}
        <div className="relative my-4 flex items-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="relative inline-block bg-canvas px-2 text-[10px] uppercase tracking-wider text-text-dim">
            OR
          </span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          disabled={isSubmitting || isGoogleSubmitting}
          onClick={handleGoogleSignIn}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-border bg-card px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-dim transition-all duration-200 hover:border-info hover:text-info hover:shadow-info-glow disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.34-1.04 2.46-2.21 3.14v2.58h3.57c2.08-1.55 3.21-3.87 3.21-6.73z"
            />
            <path
              fill="#34a853"
              d="M12 23c2.43 0 4.47-.8 6.06-2.1l2.66-2.14c-2.09 1.48-4.68 2.3-7.46 2.3-5.79 0-10.66-4.77-10.66-10.5S6.04 3.5 12 3.5c1.83 0 3.57.67 4.84 1.84l2.89 2.89c-.22.01-.45.03-.68.07-.8 0-1.57-.13-2.31-.36v2.87h.01c0 1.16.79 2.17 1.87 2.43-.08.4-.25.85-.55 1.29-.79 1.03-1.95 1.67-3.18 1.82-.05-.01-.11-.02-.18-.02z"
            />
            <path
              fill="#fbbc05"
              d="M5.84 6.79c-.31.56-.52 1.17-.63 1.83C4.44 9.28 4 10.14 4 11.08c0 1.66 1.05 3.04 2.54 3.57.02-.14.04-.28.07-.42.02-.12.04-.24.07-.36.03-.12.07-.25.12-.37l-.72-1.22c-1.22-.49-2.1-1.51-2.48-2.74z"
            />
            <path
              fill="#ea4335"
              d="M7.38 1.5C8.68 1.06 10.08.83 11.5.83c1.41 0 2.78.31 4.05.93.06.03.13.06.19.09.31-.76.68-1.52 1.1-2.24C15.25 1.1 13.91.83 12.5.83c-1.52-.01-3.03.17-4.46.69z"
            />
          </svg>
          {isGoogleSubmitting ? "[ CONNECTING... ]" : "[ CONTINUE WITH GOOGLE ]"}
        </button>

        {/* Dev Credentials Helper */}
        <div className="mt-6 rounded border border-border bg-card/40 px-3 py-2 text-[10px] font-mono text-text-dim">
          <p className="mb-1 uppercase tracking-wider text-warning">
            [ DEV_ACCESS // QUICK_LOGIN ]
          </p>
          <p>OWNER: owner@device254.dev / lab254-rock</p>
          <p>WORKER: worker@device254.dev / work254-pass</p>
          <p>CLIENT: client@device254.dev / client254-pass</p>
        </div>
      </div>
    </div>
  );
}
