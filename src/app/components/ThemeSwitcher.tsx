"use client";

import { useTheme } from "next-themes";

const themes = [
  { id: "obsidian", label: "[ ⚡_OBSIDIAN ]", activeClass: "border-neon bg-neon/10 text-neon" },
  { id: "matrix", label: "[ ◯_MATRIX ]", activeClass: "border-info bg-info/10 text-info" },
  { id: "circuit", label: "[ ⎇_CIRCUIT ]", activeClass: "border-blue-400 bg-blue-400/10 text-blue-400" },
  { id: "rust", label: "[ 🔥_RUST ]", activeClass: "border-amber-500 bg-amber-500/10 text-amber-500" },
  { id: "friendly", label: "[ ☀_FRIENDLY ]", activeClass: "border-warning bg-warning/10 text-warning" },
  { id: "cyberpunk", label: "[ 🌙_CYBERPUNK ]", activeClass: "border-pink bg-pink/10 text-pink" },
  { id: "synthwave", label: "[ 🌊_SYNTHWAVE ]", activeClass: "border-info bg-info/10 text-info" },
  { id: "retro", label: "[ 🔥_RETRO ]", activeClass: "border-warning bg-warning/10 text-warning" },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  if (!theme) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        {themes.map((t) => (
          <button
            key={t.id}
            className="rounded border border-border bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-text-dim opacity-50"
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Theme selector">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`rounded border border-border px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              isActive
                ? `${t.activeClass} shadow-neon-glow`
                : "bg-card/40 text-text-dim hover:border-info hover:text-info hover:shadow-info-glow"
            }`}
            aria-pressed={isActive}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
