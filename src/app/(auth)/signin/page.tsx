"use client";

import { Suspense } from "react";
import SigninForm from "./SigninForm";

export const dynamic = "force-dynamic";

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas font-mono">
          <span className="text-xs uppercase tracking-widest text-text-dim">
            [ AUTH_GATE_254 // INITIALIZING ]
          </span>
        </div>
      }
    >
      <SigninForm />
    </Suspense>
  );
}