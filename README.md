# Key-Kingdom.org 🏪

**The comprehensive executor marketplace for Roblox**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 What is Key-Kingdom?

Key-Kingdom.org is a **comprehensive executor marketplace** where users can:

- **Browse** executors with detailed specifications
- **Compare** features, pricing, and safety ratings
- **Read** community reviews and ratings
- **Purchase** executors securely with direct links
- **Track** real-time status and compatibility via WEAO

Think of it as the **“Amazon for Roblox executors”** – a trusted **shop hub** that prioritizes **safety** and **informed purchase decisions**.

> 🔑 **Important identity note**  
> Key-Kingdom is a **shop hub / marketplace first**, and a **status surface second**.  
> The status system (WEAO + pills) exists only to support safer purchasing.

---

## 🚀 Why Key-Kingdom?

### For Users

- ✅ **Safety First**: sUNC ratings help you choose safer executors
- ✅ **Informed Decisions**: Comprehensive descriptions, specs, and reviews
- ✅ **Real-Time Status**: Always know what’s currently working
- ✅ **Easy Comparison**: Dense **table layout** for side-by-side comparison
- ✅ **Clear Trust Signals**: Category badges (Reputable / Suspicious)

### For the Ecosystem

- 📊 Transparent safety + reliability data
- 🤝 Community-driven reviews and feedback
- 🔄 Real-time status tracking via **WEAO API**
- 🛡️ Fraud prevention via verification and categorization
- 📈 Market insights for executor developers

---

## 🏗️ Tech Stack

~~~yaml
Framework:     Next.js 14+ (App Router)
Language:      TypeScript (strict mode)
Styling:       Tailwind CSS
Animation:     Framer Motion
Data:          React Query (TanStack Query)
State:         Zustand
API:           WEAO API + Internal REST
Database:      TBD (PostgreSQL/MongoDB)
Deployment:    Vercel (recommended)
~~~

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- Git

### Installation

~~~bash
# Clone the repository
git clone https://github.com/Boostaworld/Key-Kingdom.git
cd Key-Kingdom

# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
# or
pnpm dev
# or
yarn dev
~~~

Open http://localhost:3000 in your browser.

---

## 🗂️ Project Structure (High-Level)

~~~txt
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (shop table)
│   ├── executor/[slug]/    # Executor detail pages
│   ├── reputable/          # Reputable category
│   ├── suspicious/         # Suspicious category
│   └── api/                # API routes (WEAO proxy, reviews, executors)
│
├── components/             # React components
│   ├── layout/             # Header, Footer, Nav
│   ├── shop/               # Shop table, rows, filters
│   ├── executor/           # Executor detail & review UI
│   ├── ui/                 # Buttons, badges, inputs, etc.
│   └── shared/             # Status indicators, sUNC badges, etc.
│
├── lib/                    # Utilities and helpers
│   ├── api/                # WEAO + internal API clients
│   ├── hooks/              # React Query hooks
│   ├── store/              # Zustand store (search + category, NOT pills)
│   └── utils/              # Formatters, class helpers
│
├── types/                  # TypeScript types
│   ├── executor.ts
│   ├── review.ts
│   └── user.ts
│
└── data/                   # Static mocks / seeds
    └── executors.json
~~~

---

## 📚 Documentation Map

All implementation/spec docs live under `docs/`.

> These docs intentionally overlap a bit.  
> Treat `app_spec.md` + `projectinit.md` as the **master spec**, and the others as **focused deep-dives**.

- `docs/app_spec.md`  
  **Canonical product spec** – pages, data models, UX rules, and sUNC-first behavior for the executor marketplace.

- `docs/projectinit.md`  
  **Step-by-step implementation guide** – project creation, folder structure, types, hooks, stores, and how everything wires together.

- `docs/KEYKINGDOM_BRAND_SPEC.md`  
  **Brand & visual system** – naming, tone, color palette, typography, layout patterns, and high-level design rules for Key-Kingdom.

- `docs/claude.md`  
  **AI assistant playbook** – how LLMs should talk about Key-Kingdom (executor shop hub first, status second), what terminology to use/avoid, and coding conventions.

- `docs/claudecodeimplementchecklist.md`  
  **Tactical implementation checklist** – concrete steps for Claude Code / coding agents: setup commands, priority order, and WEAO/status invariants.

- `docs/platformpillsquickref.md`  
  One-page **mental model + requirements for platform pills as status capsules** – they display Roblox build/version info and health per platform, and are **never filters**.

- `docs/animationimplementationguide.md`  
  **Animation & motion guide** – StatusDot pulse, PlatformPill expand/collapse, glassmorphism utilities, performance and reduced-motion handling.

- `docs/keykingdomshopcomponents.md`  
  Deep dive into **shop components** – ExecutorTable, ExecutorRow, FilterBar, mobile cards, and how they respect sUNC-first ordering and the design system.

- `docs/status_system.md`  
  **Status engine spec** – how executor and platform health are computed, incident detection, warning banners, and smart polling strategies.

- `docs/api_notes.md`  
  **WEAO integration notes** – endpoints, response shapes, rate limiting, Next.js proxy route patterns, and React Query usage.

- `docs/AGENTS.md`  
  **Multi-agent behavior spec** – how different agents (architect, implementer, docs, QA, etc.) should act on this repo while preserving the marketplace framing, sUNC-first ordering, and “pills = status only” rule.

If you decide to merge docs later, start by folding:

- `projectinit.md` + `keykingdomshopcomponents.md` into a single “Implementation Handbook”
- `platformpillsquickref.md` + `animationimplementationguide.md` into a “Status & Animation” guide

For now, they remain separate to keep Claude prompts small and focused.

---

## 🎨 Design Philosophy

### Modern Commerce Experience

- **Dark Theme**  
  Discord-inspired cyber-console aesthetic (see `app_spec.md` for palette).
- **Information Dense**  
  The **home view is a table**, not cards, to maximize comparison.
- **Smooth Animations**  
  Framer Motion + Tailwind animations to keep it lively but not distracting.
- **Responsive**  
  Table on desktop, card layout on mobile.

### Safety & Trust

- **sUNC Rating System (0–100)**  
  sUNC is the **primary safety metric**.
- **Category Badges**  
  Reputable vs Suspicious is always visible.
- **Community Reviews**  
  Social proof and detailed feedback.
- **Real-Time Status**  
  WEAO API powers live health indicators.

### User-Centric

- **sUNC-first ordering**  
  **Table is always sorted by sUNC descending.** No other sort overrides.
- **Status-only platform pills**  
  Pills show **platform health + Roblox version hash + timestamp**.  
  They **never filter** the list.
- **Fast & Clear**  
  Quick scanning, clear CTAs, low mental load.

---

## 📱 Core Behavior (Important Rules)

### 1. Home Page (`/`)

The home page is the **main marketplace table**:

Columns:

1. **Executor** – Logo, name, short description
2. **sUNC** – Large 0–100 safety score
3. **Status** – Working / Not Working, Roblox version, last checked
4. **Platform** – Per-executor platform tags (PC/Mac/Mobile/Android)
5. **Category** – Reputable / Suspicious badge
6. **Rating** – Stars + review count
7. **Price** – Currency formatted (or “Free”)
8. **Actions** – View Details / Buy Now

#### Sorting

- The table is **always sorted by sUNC (highest → lowest)**.
- There is **no user-controlled sort** for other columns.
- Column headers are visually static (no sort arrows).

#### Filters & Search

- **Search bar**: name + description + features.
- **Category toggle**: All / Reputable Only / Suspicious Only.
- **NO platform filtering**. Platform data is:
  - Shown as tags per executor row, and
  - Summarized by **platform status pills** at the top.

#### Platform Pills (Status Capsules)

Above the table, there is a **row of pills**:

- One pill per platform: Windows, Mac, Android, iOS.
- Each pill shows:
  - Icon + platform name
  - Status: Stable / Partial / Broken
- When expanded, each pill reveals:
  - Roblox version hash (e.g. `version-31fc142272764f02` or mobile semver)
  - Last updated time
  - Derived message (e.g. “Most Windows executors are working”)

> ⚠️ **Never filter by these pills.**  
> They are purely informational status capsules powered by WEAO + our status engine.

### 2. Executor Detail (`/executor/[slug]`)

Full “product page” with:

- Header: logo, name, sUNC badge, category badge, star rating
- Overview: description, key features, platform support, last updated
- Pricing: price, purchase link(s), payment methods
- Safety: sUNC breakdown, warnings, known issues
- Reviews: list + summary + “write review” (once auth exists)
- Sidebar: Buy Now, website, Discord, similar executors

### 3. Category Pages

- `/reputable` – Table filtered to Reputable only
- `/suspicious` – Table filtered to Suspicious only (with warnings)

---

## 📱 Features

### Current / MVP Target

- ✅ Executor **table view** (desktop) and **card view** (mobile)
- ✅ **sUNC-only** sort: highest safety first
- ✅ **Platform status pills** (status-only, not filters)
- ✅ Real-time status via **WEAO API** (through Next.js API proxy)
- ✅ Category system (Reputable / Suspicious)
- ✅ Search bar
- ✅ Executor detail pages
- ✅ Review display
- ✅ Direct purchase links

### Planned (Near Future)

- 🔄 Review submission (with auth)
- 🔄 User accounts & favorites/watchlist
- 🔄 Advanced search filters (e.g. by price, rating – **still not via pills**)
- 🔄 Price tracking over time
- 🔄 Email notifications
- 🔄 Vendor dashboard

### Later (Future)

- 📋 Public API for data
- 📋 Mobile apps (iOS / Android)
- 📋 Premium features
- 📋 Community forum / Q&A

---

## 🔌 API Integration

### WEAO API (External)

Key-Kingdom uses the official **WEAO API** (`https://weao.xyz/api`) for:

- Roblox versions:
  - `GET /versions/current`
  - `GET /versions/future`
  - `GET /versions/past`
- Exploit status:
  - `GET /status/exploits`
  - `GET /status/exploits/[exploit]`

> All WEAO calls must send `User-Agent: WEAO-3PService` from the **server-side proxy**.

See `docs/api_notes.md` for detailed response shapes, caching, and rate-limit handling.

### Internal API (Next.js Routes)

- `/api/weao/...` – Proxy to WEAO, adding headers + caching
- `/api/executors` – Internal executors list (DB-backed)
- `/api/reviews` – Review CRUD + voting
- `/api/search` – Lightweight search endpoint

---

## 🧪 Development

### Tests

~~~bash
npm run test
# or
pnpm test
# or
yarn test
~~~

### Linting

~~~bash
npm run lint
# or
pnpm lint
# or
yarn lint
~~~

### Build

~~~bash
npm run build
# or
pnpm build
# or
yarn build
~~~

---

## 🔐 Environment Variables

Create `.env.local`:

~~~env
# WEAO API
NEXT_PUBLIC_WEAO_API_URL=https://weao.xyz/api

# Optional: private base URL for server-side calls if you proxy differently
WEAO_API_BASE_URL=https://weao.xyz/api
WEAO_USER_AGENT=WEAO-3PService

# Database (TBD: Postgres / Mongo)
DATABASE_URL=your_database_connection_string

# Auth (future)
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000

# Admin emails (for moderation tools)
ADMIN_EMAILS=admin@key-kingdom.org
~~~

---

## 🤝 Contributing

We welcome contributions:

1. **Report bugs** (with repro steps)
2. **Suggest features** via issues
3. **Submit PRs** with focused changes
4. **Improve docs** & examples

Guidelines:

- Use TypeScript with strict types (no `any` unless absolutely necessary)
- Use Tailwind for styling (no random CSS files)
- Keep components small & focused
- Don’t violate the core rules:
  - Pills ≠ filters
  - sUNC is **the** sort
  - Marketplace first, status second

---

## 📊 Project Status

**Current Phase**: MVP build-out

- [x] Project setup & architecture
- [x] Design system & base components
- [x] WEAO proxy + integration
- [x] Core shop table (sUNC-first)
- [ ] Review submission
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Production deployment

---

## 📄 License

MIT – see `LICENSE`.

---

## 🙏 Acknowledgments

- **WEAO** for status + version data
- **inject.today** and similar dashboards for comparison inspiration
- The Roblox executor community for feedback and ideas

---

**Key-Kingdom.org – Your trusted executor marketplace.**  
Shop first. Status-powered safety, always in the background.
