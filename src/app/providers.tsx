"use client";

import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="obsidian"
      themes={["obsidian", "matrix", "friendly"]}
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}