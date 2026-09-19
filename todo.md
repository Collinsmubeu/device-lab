# Device Lab 254 — Website Structure & Flow (UPDATED)

## ✅ COMPLETED — All Systems Operational

### Entry Flow
1. **Intro Boot Loader** (`src/app/page.tsx`)
   - Full-screen obsidian canvas (`#09090b`) with grid mesh backdrop
   - **2-second** calibrated progress sequence: `0% → 100%` (reduced from 60s)
   - Rotating hardware inventory streamer (RAM, NVMe, GPU, thermal, vinyl)
   - `[ BYPASS_INTRO ]` escape hatch in the lower-right corner
   - Fade-in reveal into the showroom on completion

2. **Access Gateway Header** (`src/app/components/Navbar.tsx`)
   - `D V C L B // 254` logo banner with pulsing neon indicator
   - `[ SECURE_ACCOUNT // SIGN_UP ]` → `/signin?mode=register`
   - `[ AUTHENTICATE // LOGIN ]` → `/signin`
   - Live intake status badge
   - Profile dropdown with avatar, role badge, logout
   - Theme switcher moved to Sidebar

### Auth & Role Routing
- **Sign-in / Sign-up** (`src/app/(auth)/signin/page.tsx`)
  - Single gateway for both modes; `?mode=register` pre-opens registration
  - Email/password credentials + Google OAuth
  - Role assignment is server-locked:
    - `cmubeu@gmail.com` → `OWNER`
    - All other sign-ups → `CUSTOMER`
  - Workers assigned by owner through admin panel

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
  - `/customer/**`, `/trade-in`, `/` (dashboard) → any authenticated user
  - **All other routes require authentication** — unauthenticated redirected to `/signin`
  - Implemented via NextAuth `getToken()` (JWT-based, no DB round-trip)
  - Authenticated users hitting `/signin` auto-redirected to role dashboard

### Auth Architecture (NEW)
- **AuthProvider** (`src/lib/auth-provider.tsx`) — centralized context with explicit states: `loading` | `authenticated` | `unauthenticated`
- **RootLayoutClient** (`src/app/components/RootLayoutClient.tsx`) — renders correct shell based on auth state
  - `AuthLayout` (Navbar + Footer, no Sidebar) — public routes only (`/signin`)
  - `DashboardLayout` (Navbar + Sidebar + Footer) — all authenticated routes
- **DashboardLayout** / **AuthLayout** — clean separation, no duplicate rendering

### Showroom Sections
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

### Dashboards
- **Owner Command Center** (`src/app/admin/dashboard/page.tsx`)
  - Revenue / payout / margin metrics
  - Remote approval lock for large payouts (>KSh 30,000)
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

### Admin Management (NEW)
- **User Management API** (`src/app/api/admin/users/route.ts`)
  - `GET` — List all users with roles
  - `PATCH` — Change user role (WORKER ↔ CUSTOMER)
  - `DELETE` — Remove users (owner protected)
  - Audit log entries for all actions

### Design Tokens
- Canvas: `#09090b`
- Card: `#141417`
- Border / grid: `#27272a`
- Accent (neon volt green): `#22c55e`
- Danger (crimson): `#ef4444`
- Typography: strict `font-mono`

### Theme System
- `obsidian` — streetwear dark (default)
- `matrix` — high-contrast light
- `friendly` — accessibility readability mode
- `cyberpunk` — deep purple with neon pink/cyan
- `synthwave` — electric blue on black with magenta
- `retro` — warm amber on dark brown
- Controller: Sidebar theme cycler + Navbar theme picker

### Sidebar Navigation (UPDATED)
- **Common:** Dashboard Homepage, Marketplace, Trade-In Terminal
- **Owner:** Owner Dashboard, Audit Log, Payout Approvals
- **Worker:** Worker Dashboard, Diagnostic Grading
- **Client:** Customer Vault, Trade-In Offers, Service Tickets
- **Role Switcher** (OWNER only) — test different role views locally

---

## 🔧 TECHNICAL STATUS
- ✅ TypeScript: **0 errors**
- ✅ ESLint: **0 errors / 0 warnings**
- ✅ Build: **Successful** (14 routes generated)
- ✅ All routes accessible with proper auth guards
- ✅ No duplicate Navbar/Footer rendering
- ✅ Session persistence via JWT (8hr maxAge)
- ✅ Prisma schema synced with PostgreSQL

---

## 📝 NOTES
- Google OAuth account selection is browser-controlled — use incognito to test different accounts
- OWNER role assigned only to `cmubeu@gmail.com` (via ADMIN_EMAIL env)
- Workers created by OWNER via admin panel, not self-registration
- Trade-in flow works for all authenticated roles