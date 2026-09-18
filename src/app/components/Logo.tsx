"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showPulse?: boolean;
  href?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: { px: 32, text: "text-sm" },
  md: { px: 40, text: "text-base" },
  lg: { px: 56, text: "text-lg" },
  xl: { px: 80, text: "text-xl" },
} as const;

export default function Logo({ size = "md", showPulse = true, href = "/", className = "" }: LogoProps) {
  const { px, text } = SIZE_MAP[size];

  const inner = (
    <div className={`relative group ${className}`}>
      <div
        className={
          showPulse
            ? "animate-[pulseGlow_3s_ease-in-out_infinite]"
            : ""
        }
      >
        <Image
          src="/logo.jpg"
          alt="Device Lab 254"
          width={px}
          height={px}
          className={`rounded-xl border-2 border-neon object-cover transition-all duration-500 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(34,197,94,0.6)] group-hover:drop-shadow-[0_0_24px_rgba(34,197,94,0.9)] ${text}`}
          priority={size === "xl"}
        />
      </div>
      {showPulse && (
        <span className="absolute -inset-2 rounded-2xl border border-neon/30 animate-ping opacity-30" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href} aria-label="Device Lab 254 — Home">{inner}</Link>;
  }
  return inner;
}
