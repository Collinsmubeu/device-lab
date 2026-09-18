# Device Lab 254 — Website Structure & Flow

## Entry Flow

1. **Intro Boot Loader** (`src/app/page.tsx`)
   - Full-screen obsidian canvas (`#09090b`) with grid mesh backdrop
   - 60-second calibrated progress sequence: `0% → 100%`
   - Rotating hardware inventory streamer (RAM, NVMe, GPU, thermal, vinyl)
   - `[ BYPASS_INTRO ]` escape hatch in the lower-right corner
   - Fade-in reveal into the showroom on completion

2. **Access Gateway Header** (`src/app/components/Navbar.tsx`)
   - `D V C L B // 254` logo banner
   - `[ SECURE_ACCOUNT // SIGN_UP ]` → `/signin?mode=register`
   - `[ AUTHENTICATE // LOGIN ]` → `/signin`
   - Live intake status badge

## Auth & Role Routing

- **Sign-in / Sign-up** (`src/app/(auth)/signin/page.tsx`)
  - Single gateway for both modes; `?mode=register` pre-opens registration
  - Role assignment is server-locked:
    - `cmubeu@gmail.com` → `OWNER`
    - All other sign-ups → `CUSTOMER`
  - Workers are assigned by the owner through the admin layer
- **Database users** — real users with bcrypt-hashed passwords:
  - `owner@device254.dev / lab254-rock` → OWNER
  - `worker@device254.dev / work254-pass` → WORKER
  - `client@device254.dev / client254-pass` → CUSTOMER
- **Login redirect map**
  - `OWNER` → `/admin/dashboard`
  - `WORKER` → `/staff/dashboard`
  - `CUSTOMER` → `/customer/dashboard`
  - Redirects handled by `/api/auth/callback/role-redirect`
- **OAuth account linking** (`src/lib/auth-options.ts`)
  - `allowDangerousEmailAccountLinking: true` on Google provider
  - Existing DB users with matching email get Google OAuth account auto-linked
  - No more `OAuthAccountNotLinked` or `OAuthCreateAccount` errors
- **Session middleware** (`middleware.ts`)
  - `/admin/**` → OWNER only
  - `/staff/**` → WORKER or OWNER
  - `/customer/**`, `/checkout/**`, `/cash-out/**` → any authenticated user
  - Implemented via NextAuth `getToken()` (JWT-based, no DB round-trip)
  - Redirect unauthenticated users to `/signin?callbackUrl=<original_path>`
  - Role-based access enforcement on protected routes

## Showroom Sections

1. **Split-Screen Hero** (`src/app/components/HeroSection.tsx`)
   - `GEAR FOR THE MAIN CHARACTER.` headline
   - `[ SECURE THE SETUP ]` and `[ OFFLOAD USED GEAR ]` actions

2. **Laptop Inventory Grid** (`src/app/components/LaptopCatalog.tsx`)
   - 4-column responsive bento layout
   - Active stock: neon green hover border + outer glow
   - Archived / sold out: crimson red hover border + dark-red wash
   - KSh pricing, condition grades, core tiers

3. **Trade-In Terminal** (`src/app/trade-in/page.tsx`)
   - Dedicated offload page powered by `QuoteEngine`
   - 3-step valuation: brand/year → specs → condition
   - M-Pesa cash-out certificate

## Dashboards

- **Owner Command Center** (`src/app/admin/dashboard/page.tsx`)
  - Revenue / payout / margin metrics
  - Remote approval lock for large payouts
  - Read-only audit terminal
  - Employee count

- **Worker Intake Board** (`src/app/staff/dashboard/page.tsx`)
  - 5-point diagnostic grading
  - Repair / fulfillment kanban
  - Per-worker audit trail

- **Customer Vault** (`src/app/customer/dashboard/page.tsx`)
  - Purchased hardware ledger
  - Pending trade-in offers
  - Repair ticket tracker

## Design Tokens

- Canvas: `#09090b`
- Card: `#141417`
- Border / grid: `#27272a`
- Accent (neon volt green): `#22c55e`
- Danger (crimson): `#ef4444`
- Typography: strict `font-mono`

## Theme System

- `obsidian` — streetwear dark (default)
- `matrix` — high-contrast light
- `friendly` — accessibility readability mode
- Controller: `src/app/components/ThemeSwitcher.tsx`
