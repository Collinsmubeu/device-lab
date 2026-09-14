/**
 * Device Lab 254 — Central configuration.
 *
 * Single source of truth for every tunable business value so nothing is
 * scattered as magic numbers inside components or route handlers. Tune the
 * storefront by editing this file; rotate secrets via env vars (see
 * `src/lib/auth.ts`).
 */

/** Canonical processor tier — also gates the valuation uplift table. */
export type Processor =
  | "Apple Silicon"
  | "Intel Core i9"
  | "AMD Ryzen 9"
  | "Intel Core i7"
  | "AMD Ryzen 7"
  | "Intel Core i5";

export const BRANDS = ["Apple", "ASUS", "Dell", "HP", "Lenovo", "MSI", "Razer"];

export const PROCESSORS: Processor[] = [
  "Apple Silicon",
  "Intel Core i9",
  "AMD Ryzen 9",
  "Intel Core i7",
  "AMD Ryzen 7",
  "Intel Core i5",
];

export const RAM_OPTIONS: readonly number[] = [8, 16, 32, 64];
export const STORAGE_OPTIONS: readonly number[] = [256, 512, 1024, 2048];
export const MIN_YEAR = 2016;
export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS: readonly number[] = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
);

/** Valuation algorithm parameters (KSh). */
export const BRAND_BASE_KSH: Record<string, number> = {
  Apple: 60000,
  ASUS: 45000,
  Dell: 40000,
  HP: 38000,
  Lenovo: 40000,
  MSI: 42000,
  Razer: 43000,
};

export const PROCESSOR_TIER: Record<string, number> = {
  "Apple Silicon": 1.3,
  "Intel Core i9": 1.15,
  "AMD Ryzen 9": 1.12,
  "Intel Core i7": 1.0,
  "AMD Ryzen 7": 0.95,
  "Intel Core i5": 0.85,
};

export const RAM_BONUS_PER_8GB = 3000;
export const STORAGE_BONUS_PER_256GB = 2000;
export const YEAR_DEPRECATION_RATE = 0.08; // -8% per year of age
export const COOKED_THRESHOLD = 0.3; // <=30% condition => "cooked" band
export const MIN_YEAR_FACTOR = 0.2; // never depreciate older than 80%

/** Admin Command Center — cash payouts at/above this need owner override. */
export const PAYOUT_OVERRIDE_FLOOR_KSH = 30000;
