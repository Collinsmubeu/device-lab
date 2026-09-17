"use client";

import { useTheme } from "next-themes";

const themes = [
  { id: "obsidian", label: "[ ⚡_OBSIDIAN ]" },
  { id: "matrix", label: "[ ◯_MATRIX ]" },
  { id: "friendly", label: "[ 👁_FRIENDLY ]" },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  // `theme` is undefined until next-themes hydrates on the client.
  // Rendering a stable placeholder here prevents hydration mismatches.
  if (!theme) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        {themes.map((t) => (
          <button
            key={t.id}
            className="px-3 py-1.5 text-[11px] uppercase tracking-wider border border-zinc-800 bg-zinc-900/50 rounded opacity-50 pointer-events-none"
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Theme selector">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border rounded transition-all duration-150 ${
            theme === t.id
              ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px]_var(--accent)"
              : "border-zinc-800 bg-zinc-900/50 text-text-dim hover:border-zinc-700 hover:text-text"
          }`}
          aria-pressed={theme === t.id}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}