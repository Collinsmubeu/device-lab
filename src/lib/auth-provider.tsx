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

function decodeCustomCookie(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)dl254_session=([^;]*)/);
  if (!match) return null;
  try {
    const body = match[1].split(".")[0];
    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    if (payload.exp < Date.now() / 1000) return null;
    return {
      id: payload.userId ?? "",
      email: payload.email ?? "",
      name: payload.email?.split("@")[0] ?? null,
      image: null,
      role: payload.role ?? "CUSTOMER",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const customUser = decodeCustomCookie();

  const nextAuthUser: User | null = session?.user
    ? {
        id: (session.user as { id?: string }).id ?? "",
        email: session.user.email ?? "",
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        role: (session.user as { role?: "OWNER" | "WORKER" | "CUSTOMER" }).role ?? "CUSTOMER",
      }
    : null;

  const user = nextAuthUser || customUser;
  const authStatus: AuthStatus = status === "loading" && !customUser
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

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
