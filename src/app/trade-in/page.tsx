import QuoteEngine from "@/app/components/QuoteEngine";

export const metadata = {
  title: "Trade In Your Rig — Device Lab 254",
  description: "Get an instant, transparent valuation for your used laptop. M-Pesa payout, zero hassle.",
};

export default function TradeInPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight uppercase">
          OFFLOAD YOUR RIG
        </h1>
        <p className="mt-2 text-text-dim max-w-2xl">
          Transparent, instant valuations. No lowball offers. M-Pesa payout dispatched same day.
          Your old hardware funds the next upgrade.
        </p>
      </header>

      <section aria-labelledby="quote-heading" className="max-w-2xl">
        <h2 id="quote-heading" className="sr-only">
          Instant Valuation Engine
        </h2>
        <QuoteEngine />
      </section>
    </main>
  );
}
