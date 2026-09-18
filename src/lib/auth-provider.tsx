"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "OWNER" | "WORKER" | "CUSTOMER";
}

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const authStatus: AuthStatus = status === "loading" ? "loading" : session?.user ? "authenticated" : "unauthenticated";

  const user: User | null = session?.user
    ? {
        id: (session.user as { id?: string }).id ?? "",
        email: session.user.email ?? "",
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        role: (session.user as { role?: "OWNER" | "WORKER" | "CUSTOMER" }).role ?? "CUSTOMER",
      }
    : null;

  return (
    <AuthContext.Provider value={{ status: authStatus, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}