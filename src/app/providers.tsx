"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth-provider";
import type { ThemeProviderProps } from "next-themes";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="obsidian"
          themes={["obsidian", "matrix", "friendly", "cyberpunk", "synthwave", "retro"]}
          {...props}
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}