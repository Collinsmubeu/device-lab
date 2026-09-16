import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import LaptopCatalog from "@/app/components/LaptopCatalog";
import QuoteEngine from "@/app/components/QuoteEngine";

/**
 * Device Lab 254 — Home Page (Server Component)
 *
 * Assembles the obsidian streetwear storefront: sticky nav, hero,
 * bento catalog, cash-out engine, and industrial footer.
 */
export default function Home() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />

        <section
          id="marketplace"
          aria-labelledby="marketplace-heading"
          className="mt-16"
        >
          <h2
            id="marketplace-heading"
            className="mb-6 text-xs font-medium uppercase tracking-wider text-text-dim"
          >
            Current Drops
          </h2>
          <LaptopCatalog />
        </section>

        <section
          id="cash-out"
          aria-labelledby="cash-out-heading"
          className="mt-16"
        >
          <h2
            id="cash-out-heading"
            className="mb-6 text-xs font-medium uppercase tracking-wider text-text-dim"
          >
            Offload Your Rig
          </h2>
          <QuoteEngine />
        </section>
      </main>

      {/* ── Industrial Footer Matrix ── */}
      <footer className="border-t border-border bg-card/60 px-6 py-8 font-mono">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="space-y-1 text-xs text-text-dim">
              <p>{"// STATUS: SYSTEMS_NOMINAL"}</p>
              <p>{"// LOCATION: NAIROBI_KENYA"}</p>
            </div>

            <a
              href="/admin"
              className="text-[10px] uppercase tracking-wider text-text-dim transition-colors hover:text-neon"
            >
              [ ADMINISTRATIVE_PORTAL ]
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
