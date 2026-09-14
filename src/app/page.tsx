import LaptopCatalog from "@/app/components/LaptopCatalog";
import QuoteEngine from "@/app/components/QuoteEngine";

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-card/60 px-6 py-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.25em] text-text-dim uppercase">
            Device Lab 254 — Nairobi
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
            PREMIUM REFLINED HARDWARE
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-text-dim">
            Obsidian-vetted laptops. Street-tested. Vault-grade where it counts.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-6 py-10 sm:px-8">
        <section aria-labelledby="catalog-heading">
          <h2 id="catalog-heading" className="sr-only">
            Current stock
          </h2>
          <LaptopCatalog />
        </section>

        <section aria-labelledby="quote-heading">
          <h2
            id="quote-heading"
            className="mb-4 text-xs tracking-[0.25em] text-text-dim uppercase"
          >
            OFFLOAD YOUR RIG
          </h2>
          <QuoteEngine />
        </section>
      </main>

      <footer className="border-t border-border bg-card/60 px-6 py-6 text-center text-xs text-text-dim">
        <p className="font-mono">
          &copy; {new Date().getFullYear()} Device Lab 254 — KSh all in.
        </p>
      </footer>
    </>
  );
}
