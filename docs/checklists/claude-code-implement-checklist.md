# Claude Code Implementation Checklist for Key-Kingdom

This document is for **Claude Code (and other AI coding assistants)** implementing Key-Kingdom.org.

Key-Kingdom.org is a **Roblox executor marketplace / shop hub**, **not** a generic status tracker. The status system exists to support **safe purchasing decisions**, not as the core product.

---

## 🎯 Project Overview

Build **Key-Kingdom.org** — a WEAO-powered **executor marketplace** with:

- A **table-based shop** view (desktop primary)
- **sUNC-first safety sorting** (highest sUNC at top, always)
- **Platform pills as status capsules (NOT filters)**
- Real-time **status + Roblox build info** via WEAO
- A clear path from **browse → inspect → buy → review**

> Core mental model for the home page:  
> **“Amazon-style product table for executors, sorted by safety.”**

---

## 📋 Pre-Implementation Setup

### 1. Initialize Project

Use Next.js App Router with TypeScript and Tailwind:

```bash
npx create-next-app@latest key-kingdom \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd key-kingdom

npm install framer-motion @tanstack/react-query zustand lucide-react date-fns
npm install clsx tailwind-merge
If the repo already exists, do not re-init. Just make sure dependencies and config match the above.

2. Environment Variables
Create .env.local:

bash
Copy code
# WEAO API base (proxy or direct)
WEAO_API_BASE_URL=https://weao.xyz/api
WEAO_USER_AGENT=WEAO-3PService

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_REFRESH_INTERVAL=300000  # 5 minutes in ms
If you later introduce a Next.js API proxy (recommended), you can:

Keep WEAO_API_BASE_URL as the origin you proxy to

Have frontend code call your own /api/weao/... endpoints

Details for the proxy live in docs/api_notes.md.

✅ Core Requirements Checklist
1. Platform Pills (STATUS CAPSULES — NOT FILTERS)
They show platform health + Roblox builds. They never hide or filter executors.

UI / Behavior:

 Pills are rendered for each platform (Windows, Mac, Android, iOS)

 Each pill shows:

 Platform icon + name (e.g., 🖥 Windows, 🍎 Mac, 🤖 Android, 📱 iOS)

 Current platform status label:

Stable, Partial, or Broken (derived from status system)

 When pill is expanded, it shows:

 Roblox version string (hash for desktop, semantic version for mobile)

 “Last checked X minutes ago”

 Short build status message (e.g., “Most Windows executors are working”)

 Only one pill expanded at a time

 Smooth expand/collapse animation using Framer Motion

 Pills do NOT filter executors in any way

 Pills use glassmorphism styling with subtle glow + blur

Data Source:

Use WEAO version endpoints (proxied via Next.js API):

/versions/current

(Optional) /versions/future, /versions/past for banners/history

Aggregate executor status to compute platform health (Stable/Partial/Broken).
See docs/status_system.md for platform health algorithm.

2. Executor Display (Main Shop Table)
This is the primary “shop” experience on desktop.

Table & Sorting:

 Executor list is always sorted by sUNC (descending):

 Primary sort: sUNC (highest at top)

 Secondary tie-break: working status (working first)

 Tertiary tie-break: name A→Z

 No alternative primary sort modes for the main table

 Executor list is a table on desktop; can degrade to cards on mobile

Row Content (desktop table):

 Executor:

 Logo (40×40, rounded)

 Name (bold)

 Short description (muted, line-clamped)

 sUNC:

 Large number (e.g. 98) with label (e.g. “Very Safe”)

 Color-coded by safety tier (see docs/keykingdomshopcomponents.md)

 Status:

 Status dot (working, broken, updating) with pulse

 “Working” / “Not working” text

 Roblox version string

 “Last checked X minutes ago”

 Platform:

 Platform tags visible on each row (PC/Mac/Mobile/Android)

 Compact, non-filtering display

 Category:

 Badge (Reputable / Suspicious)

 Rating:

 Stars (0–5; decimals allowed)

 Review count

 Price:

 Formatted price or “Free”

 Actions:

 View Details button (ghost)

 Buy Now button (primary CTA)

 Click row (outside buttons) → navigate to detail page

Status Dot:

 Glowing, pulsing dot indicates:

 Green: working

 Red: broken

 Yellow: updating/partial

 Uses Tailwind keyframes (pulse-glow, status-ring) from docs/animationimplementationguide.md

3. Visual Design
Theme:

 Dark theme using the shared palette:

background.DEFAULT #0B0E11

background.surface #151A21

background.elevated #1E2329

primary #5865F2

success #43B581

danger #F04747

warning #FAA61A

 Discord-inspired “cyber console” look

 Glassmorphism touches on pills/cards (backdrop blur, semi-transparent surfaces)

Layout & Responsiveness:

 Desktop: table view, hover states, high information density

 Tablet: condensed table (may hide less critical columns)

 Mobile:

 Switches from table to card layout for executors

 Pills stack vertically at top

 Filters/sort controls collapse thoughtfully

 Custom scrollbar styling (subtle, dark-theme-appropriate)

Animations:

 Use Framer Motion for:

 Table row entrance (staggered)

 Platform pill expansion

 Banner in/out (if using status banners)

 Small hover and tap feedback

 Animations are:

 Subtle

 200–300ms

 GPU-friendly (transform + opacity)

4. API Integration
Never call WEAO directly from the browser. Always proxy through Next.js API routes.

Proxying WEAO:

 Create a server-side proxy route such as:

text
Copy code
src/app/api/weao/[...path]/route.ts
 Proxy to WEAO_API_BASE_URL with header:

User-Agent: WEAO-3PService (required)

 Implement in-proxy caching for:

/versions/* (e.g. 5-minute TTL)

/status/exploits (e.g. 2-minute TTL)

 Handle 429 rate limit gracefully and pass structured info back

React Query Usage:

 useRobloxVersions hook:

Calls your /api/weao/versions/current

staleTime ≈ 5 minutes

refetchInterval ≈ 5 minutes

retries with backoff (except on rate-limit)

 useExecutorStatus hook:

Calls your /api/weao/status/exploits

staleTime ≈ 2 minutes

refetchInterval ≈ 2 minutes (adaptive via status system is OK)

On 429: show UX message, skip retry until reset

Data Flow:

text
Copy code
WEAO API
   ↓ (proxied via /api/weao/...)
Next.js API routes (with caching + UA header)
   ↓
React Query hooks
   ↓
Status system helpers (platform health, incidents)
   ↓
UI components (pills, status dots, banners, table)
Full endpoint details and example proxy implementation live in docs/api_notes.md.

🚀 Implementation Priority Order
Use this order when guiding Claude Code or planning tasks.

Phase 1: Core Structure
 Confirm project structure (src/app, src/components, etc.)

 Add ReactQuery provider and root layout wrappers

 Implement src/app/api/weao/[...path]/route.ts proxy

 Add TypeScript types for WEAO responses and core Executor model

 Add base Tailwind config (colors, fonts, animations)

Phase 2: Status System & Platform Pills
 Implement WEAO integration hooks:

useRobloxVersions

useExecutorStatus

 Implement status system helpers (calculatePlatformHealth, detectGlobalIncident, etc.) per docs/status_system.md

 Build PlatformPill with expand/collapse animation

 Build PlatformSelector container:

 Keeps track of which pill is expanded

 Enforces “one at a time” rule

 Ensure pills are purely informational (no filtering logic)

Phase 3: Executor Display (Shop Table)
 Create ExecutorTable (desktop table, mobile cards)

 Create ExecutorRow (desktop) and ExecutorCard (mobile)

 Wire in useExecutors hook:

 Merges static executor data with live WEAO status

 Applies sUNC-first sorting

 Build shared components:

 StatusDot

 StatusIndicator

 SuncBadge

 CategoryBadge

 StarRating

 Add “View Details” and “Buy Now” actions

Phase 4: Polish & Status UX
 Add loading and error states throughout

 Implement “smart polling” or incident-aware poll intervals (optional; see docs/status_system.md)

 Add any global warning banners for major incidents

 Performance tuning:

 Memoization

 Avoid unnecessary re-renders

 Lazy-load heavier components if needed

🎨 Key Visual References
Platform Pill States
text
Copy code
[Collapsed]
┌─────────────────────────────┐
│ 🖥️ Windows • STABLE        │
└─────────────────────────────┘

[Expanded]
┌─────────────────────────────┐
│ 🖥️ Windows • STABLE        │
├─────────────────────────────┤
│ Version: version-31fc14...  │
│ Last checked: 2 min ago     │
│ Status: Most executors OK   │
└─────────────────────────────┘
Executor Row (Desktop)
text
Copy code
[🟢] Synapse X            98  (Very Safe)
     Reputable

[Windows] [Mac] [Android]       ★ 4.8 (1.2k reviews)

Price: $20
Status: Working • vversion-31fc... • 2 min ago

[View Details]  [Buy Now]
🗂️ File Structure Must-Haves
This is a minimum skeleton Claude Code should aim for. The exact grouping can evolve, but these concepts must exist.

text
Copy code
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Home: main executor table
│   ├── executor/
│   │   └── [slug]/
│   │       └── page.tsx         # Executor detail page
│   ├── reputable/
│   │   └── page.tsx             # Reputable-only view (still sUNC-sorted)
│   ├── suspicious/
│   │   └── page.tsx             # Suspicious-only view
│   └── api/
│       └── weao/
│           └── [...path]/route.ts  # Proxy to WEAO API (versions, status)
│       # (Optional legacy-style aliases:
│       #  - /api/roblox/versions/route.ts → forwards to weao/versions/current
│       #  - /api/executors/route.ts      → forwards to weao/status/exploits )
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── StatusDot.tsx
│   │   └── Input.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── shop/
│   │   ├── ExecutorTable.tsx
│   │   ├── ExecutorRow.tsx
│   │   ├── ExecutorCard.tsx      # Mobile card layout
│   │   └── PlatformStatusPills.tsx
│   ├── shared/
│   │   ├── StatusIndicator.tsx
│   │   ├── SuncBadge.tsx
│   │   ├── CategoryBadge.tsx
│   │   └── StarRating.tsx
│   └── status/
│       ├── PlatformPill.tsx
│       └── PlatformSelector.tsx
│
├── lib/
│   ├── api/
│   │   └── weao.ts              # Client helpers for calling our own API routes
│   ├── hooks/
│   │   ├── useExecutors.ts
│   │   ├── useRobloxVersions.ts
│   │   └── useExecutorStatus.ts
│   ├── store/
│   │   └── appStore.ts          # UI state (filters, search, expanded pill)
│   └── utils/
│       ├── cn.ts
│       ├── formatters.ts
│       └── statusHelpers.ts     # Platform health, incidents, banners
│
└── types/
    ├── executor.ts
    ├── review.ts
    └── weao.types.ts
🧪 Testing Checklist
Platform Pills
 Clicking a pill expands it to show version + timestamps

 Clicking another pill collapses the previous one

 Expanding/collapsing animation is smooth (no jump)

 Pills never hide or filter executor rows

 Status text and colors match platform health logic

Executor Display & Sorting
 Executors are always ordered by sUNC descending

 Working executors appear before broken ones when sUNC ties

 Names break ties alphabetically

 Platform tags show all supported platforms for each executor

 Status dots reflect working/broken/updating correctly

 “View Details” navigates correctly; “Buy Now” opens external link

Status System Behavior
 When major platforms are broken, banners/pills reflect Broken

 Reduction in working executors correctly flips platform to “Partial”/“Broken”

 Polling intervals change appropriately (if smart polling implemented)

 Rate-limited situations display user-friendly messages, not raw errors

Responsive Design
 Mobile:

 Table becomes cards

 Content still complete and legible

 CTAs remain prominent

 Tablet:

 Table columns adapt without overflow

 No horizontal scroll on typical viewport sizes except for intended table overflow container

Performance
 Initial load feels snappy (no long blocking)

 Animations are ~60fps on reasonable hardware

 No obvious layout shifts (CLS kept low)

 React DevTools shows minimal unnecessary re-renders

🎯 Success Criteria
The implementation is considered correct when:

Platform pills:

Show platform status and Roblox versions

Do not filter executors

Animate smoothly with single-pill expansion

Main executor list:

Is a table-based shop view

Is always sorted by sUNC descending

Clearly shows status, platforms, category, rating, and price

Provides clear “View Details” and “Buy Now” paths

Status system:

Uses WEAO data via Next.js API routes

Updates in near real-time with sensible polling & caching

Surfaces critical incidents through pills and (optionally) banners

UX:

Works well on desktop, tablet, and mobile

Feels like an e-commerce experience, not a raw status dashboard

Maintains the dark, Discord-inspired aesthetic

Code:

Uses proper TypeScript types and organized file structure

Uses React Query + Zustand appropriately (no duplicated state)

Follows patterns described across docs/app_spec.md, docs/projectinit.md, and docs/keykingdomshopcomponents.md

📚 Reference Documents
When implementing or refactoring, Claude Code should always cross-check with:

docs/app_spec.md — Full product & page-level specification

docs/claude.md — AI assistant style & identity guide

docs/projectinit.md — Setup and broader implementation plan

docs/keykingdomshopcomponents.md — Component-by-component behavior

docs/platformpillsquickref.md — Platform pill behavior (status-only)

docs/status_system.md — Status calculation & incident handling

docs/api_notes.md — Detailed WEAO API integration

🚦 Final Reminders
Platform pills = STATUS ONLY
They never filter — they report platform health & Roblox builds.

Main shop list = sUNC-first sorting
Higher sUNC = higher in the list, always.

Key-Kingdom is a SHOP
Every UX decision should help users choose and buy executors safely.

Status data is a supporting actor
It exists to protect users’ purchases, not to be a standalone status product.