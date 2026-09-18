import { Geist_Mono } from "next/font/google";

const mono = Geist_Mono({ subsets: ["latin"] });

export default function AdminLoginPage() {
  return (
    <main
      className={`${mono.className} flex min-h-screen items-center justify-center bg-canvas text-text font-mono antialiased`}
    >
      <div className="w-full max-w-md px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs tracking-wider text-text-dim">
            <span className="h-px w-8 bg-border" />
            <span>DEVICE LAB 254</span>
            <span className="h-px w-8 bg-border" />
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-text">
            OWNER COMMAND CENTER
          </h1>
          <p className="mt-1 text-sm text-text-dim">
            authenticate to access remote auditing + payout overrides
          </p>
        </div>

        <form
          action="/api/admin/login"
          method="POST"
          className="rounded-xl border border-border bg-card/60 p-6 shadow-[0_0_22px_theme(colors.neon)/0.15]"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-[10px] uppercase tracking-wider text-text-dim"
              >
                operator id
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded border border-border bg-card/80 px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-neon outline-none"
                placeholder="owner@device254.dev"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-[10px] uppercase tracking-wider text-text-dim"
              >
                passcode
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded border border-border bg-card/80 px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-neon outline-none"
                placeholder="enter passcode"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded border border-neon bg-neon/10 py-2 text-[12px] font-mono font-bold text-neon uppercase tracking-wider transition hover:bg-neon/20"
          >
            [ INITIATE SECURE SESSION ]
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-text-dim">
          credentials verified against the database.
        </p>
      </div>
    </main>
  );
}
