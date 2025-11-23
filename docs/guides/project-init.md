# Key-Kingdom.org - Implementation Guide for Claude Code

## 🎯 Project Overview

You are building **Key-Kingdom.org** – a comprehensive **executor marketplace and shop hub for Roblox executors**.

- This is **NOT** just a status tracker.
- The **main UX** is a **commerce-first table of executors**, sorted by **sUNC safety score**.
- WEAO is used as the **live data backbone** for versions and exploit status, but the product itself is a **shop hub**.

Key mental model:

> **Marketplace/shop first. Status tracking second.**  
> The status engine (WEAO) exists to **support safer purchasing decisions**.

---

## 📋 Pre-Implementation Checklist

Before writing any code, make sure you are clear on:

1. ✅ This is a **marketplace/shop** – commerce-focused, Amazon-style hub
2. ✅ Main view is a **table layout** (like inject.today)
3. ✅ **sUNC rating is the primary and only sort** in the main shop:
   - Higher `sUNC` = higher in the list  
   - Default and enforced sort: **sUNC descending**
4. ✅ **Platform pills are *status capsules only***:
   - They show Roblox version + last updated per OS
   - They **do not filter** the executor list
   - Only **one pill can be expanded** at a time
5. ✅ **WEAO API integration** is used to:
   - Get Roblox version hashes per platform
   - Get exploit (executor) status and sUNC percentages
6. ✅ **Review system** is core to trust (even if Phase 2+ for submission)
7. ✅ **Dark, modern Discord-like aesthetic**
8. ✅ Use the docs in `docs/` (this repo) as your single source of truth:
   - `APP_SPEC.md` – full product spec
   - `CLAUDE.md` – how AI tools should think/talk about the project
   - `CLAUDECODEIMPLEMENTCHECKLIST.md` – high-level build checklist
   - `PLATFORMPILLSQUICKREF.md` – pills behavior model
   - `ANIMATIONIMPLEMENTATIONGUIDE.md` – animation patterns
   - `STATUS_SYSTEM.md` – how status data is derived & displayed
   - `API_NOTES.md` – WEAO integration details
   - `key-kingdom-shop-components.md` – component-level spec

---

## 🛠️ Tech Stack

```yaml
Framework: Next.js 14+ (App Router, /src)
Language: TypeScript (strict mode)
Styling: Tailwind CSS
Animation: Framer Motion
Data Fetching: React Query (TanStack Query)
Client State: Zustand
Icons: Lucide React
Fonts: Inter, JetBrains Mono
Deployment: Vercel (recommended)
📦 Project Setup
Step 1: Initialize Next.js Project
From an empty repo (or local folder that’s already git init-ed):

bash
Copy code
npx create-next-app@latest key-kingdom \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd key-kingdom
If this repo is already created on GitHub:

bash
Copy code
git remote add origin https://github.com/<you>/Key-Kingdom.git
# (or update existing origin to match)
Step 2: Install Dependencies
bash
Copy code
# Core dependencies
npm install @tanstack/react-query zustand framer-motion lucide-react date-fns

# UI utilities
npm install clsx tailwind-merge

# Development types (if not already)
npm install -D @types/node @types/react @types/react-dom
If you prefer pnpm or yarn, swap the commands, but keep the same packages.

📁 Step 3: Project Structure
Target structure (MVP):

bash
Copy code
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (shop table)
│   ├── executor/
│   │   └── [slug]/
│   │       └── page.tsx        # Detail page
│   ├── reputable/
│   │   └── page.tsx            # Reputable category view
│   ├── suspicious/
│   │   └── page.tsx            # Suspicious category view
│   ├── about/
│   │   └── page.tsx            # About page
│   └── api/
│       ├── weao/
│       │   └── [...path]/route.ts  # WEAO proxy route
│       ├── executors/
│       │   └── route.ts        # Internal executors API (DB/mock)
│       └── reviews/
│           └── route.ts        # Review API (later phases)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── shop/
│   │   ├── ExecutorTable.tsx    # Main table component
│   │   ├── ExecutorRow.tsx      # Each table row
│   │   ├── FilterBar.tsx        # Search & filters (NOT status pills)
│   │   └── PlatformStatusStrip.tsx # Status capsules (platform pills)
│   ├── executor/
│   │   ├── ExecutorHeader.tsx   # Detail page header
│   │   ├── ExecutorInfo.tsx     # Main info section
│   │   ├── ReviewList.tsx       # Reviews display
│   │   └── ReviewForm.tsx       # Submit review (Phase 2+)
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── StarRating.tsx
│   └── shared/
│       ├── StatusIndicator.tsx
│       ├── SuncBadge.tsx
│       └── CategoryBadge.tsx
│
├── lib/
│   ├── api/
│   │   ├── weao.ts             # WEAO client (calls Next proxy)
│   │   └── internal.ts         # Internal API calls
│   ├── hooks/
│   │   ├── useExecutors.ts     # Executor data hook (WEAO + DB)
│   │   ├── useRobloxVersions.ts# Roblox versions (for pills)
│   │   └── useFilters.ts       # Any local filter helpers
│   ├── store/
│   │   └── appStore.ts         # Zustand UI store (filters only)
│   └── utils/
│       ├── cn.ts               # Class name merger
│       └── formatters.ts       # Date, price, sUNC formatters
│
├── types/
│   ├── executor.ts
│   ├── review.ts
│   └── user.ts
│
└── data/
    └── executors.json          # Initial executor data / seeds
🎨 Step 4: Configure Tailwind
Update tailwind.config.ts:

ts
Copy code
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme
        background: {
          DEFAULT: "#0B0E11",
          surface: "#151A21",
          elevated: "#1E2329",
        },
        // Accent colors
        primary: "#5865F2", // Discord blurple
        success: "#43B581",
        danger: "#F04747",
        warning: "#FAA61A",
        // Text
        text: {
          primary: "#FFFFFF",
          secondary: "#B9BBBE",
          muted: "#72767D",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
Animation details (status dot, platform pills, glassmorphism) are fully specified in:

docs/ANIMATIONIMPLEMENTATIONGUIDE.md

docs/PLATFORMPILLSQUICKREF.md

Use those for exact Tailwind classes + Framer Motion patterns.

🔧 Step 5: Core Utilities
src/lib/utils/cn.ts
ts
Copy code
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
src/lib/utils/formatters.ts
ts
Copy code
import { formatDistanceToNow } from "date-fns";

export function formatPrice(
  price: number | undefined,
  currency = "USD"
): string {
  if (!price || price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

export function formatRelativeTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(value, { addSuffix: true });
}

export function formatSuncRating(
  sunc: number
): {
  label: string;
  color: string;
} {
  if (sunc >= 90) return { label: "Very Safe", color: "text-success" };
  if (sunc >= 75) return { label: "Safe", color: "text-success" };
  if (sunc >= 60) return { label: "Moderate", color: "text-warning" };
  if (sunc >= 40) return { label: "Risky", color: "text-warning" };
  return { label: "Dangerous", color: "text-danger" };
}
📝 Step 6: Type Definitions
src/types/executor.ts
ts
Copy code
export type Platform = "windows" | "mac" | "mobile" | "android";

export type ExecutorCategory = "reputable" | "suspicious";

export interface ExecutorStatus {
  working: boolean;
  robloxVersion: string;
  lastChecked: Date;
  lastStatusChange?: Date;
}

export interface ExecutorPricing {
  type: "free" | "paid" | "freemium";
  price?: number;
  currency?: string;
  purchaseUrl: string;
  freeTrial?: boolean;
  rawCostString?: string; // from WEAO, e.g. "$20 Lifetime"
}

export interface ExecutorRating {
  average: number; // 0–5
  count: number;
}

export interface ExecutorLinks {
  website?: string;
  discord?: string;
  documentation?: string;
}

export interface Executor {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  logo: string;
  images?: string[];

  // Safety & Status
  suncRating: number; // 0–100 (derived from WEAO suncPercentage)
  category: ExecutorCategory;
  status: ExecutorStatus;

  // Platform Support
  platforms: {
    windows: boolean;
    mac: boolean;
    mobile: boolean;
    android?: boolean;
  };

  // Commerce
  pricing: ExecutorPricing;

  // Social
  rating: ExecutorRating;
  links?: ExecutorLinks;

  // Features
  features: string[];
  keyFeatures?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  popular?: boolean;
}
src/types/review.ts
ts
Copy code
export interface Review {
  id: string;
  executorId: string;
  userId: string;
  username: string;

  rating: number; // 1–5
  title?: string;
  content: string;

  verifiedPurchase: boolean;

  helpful: number;
  notHelpful: number;

  createdAt: Date;
  updatedAt?: Date;

  status: "published" | "flagged" | "removed";
}
🗄️ Step 7: State Management (Zustand)
Important:

The main table is always sorted by sUNC descending.

The store manages filters and search only, not sort order.

If you ever add alternative sorts in the future, document them explicitly and make sure they don’t conflict with the “sUNC-first” rule.

src/lib/store/appStore.ts
ts
Copy code
import { create } from "zustand";
import type { Platform, ExecutorCategory } from "@/types/executor";

interface FilterState {
  platformFilter: Platform[];                 // e.g. ["windows", "mac"]
  categoryFilter: "all" | ExecutorCategory;   // "all" | "reputable" | "suspicious"
  searchQuery: string;                        // free-text search
}

interface AppStore extends FilterState {
  setPlatformFilter: (platforms: Platform[]) => void;
  setCategoryFilter: (category: "all" | ExecutorCategory) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  platformFilter: [],
  categoryFilter: "all",
  searchQuery: "",
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setPlatformFilter: (platforms) =>
    set({ platformFilter: platforms }),

  setCategoryFilter: (category) =>
    set({ categoryFilter: category }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  resetFilters: () =>
    set(initialState),
}));
Rule: All sorting logic lives in one place, e.g. sortExecutorsBySUNC helper (see below / API_NOTES.md). Do not introduce conflicting sorts in components.

🌐 Step 8: WEAO API Integration
All low-level WEAO details live in docs/API_NOTES.md. Here we just wire up a thin client that calls our proxy route.

8.1 Next.js WEAO Proxy Route
Create src/app/api/weao/[...path]/route.ts:

ts
Copy code
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = "https://weao.xyz/api"; // see API_NOTES.md

const CACHE_TTL_MS = {
  versions: 5 * 60 * 1000,  // 5 minutes
  status: 2 * 60 * 1000,    // 2 minutes
};

const memoryCache = new Map<
  string,
  { data: unknown; timestamp: number; status: number }
>();

function getTtlForPath(path: string): number {
  if (path.startsWith("versions")) return CACHE_TTL_MS.versions;
  if (path.startsWith("status")) return CACHE_TTL_MS.status;
  return 60 * 1000; // default 1 min
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${UPSTREAM_BASE}/${path}`;
  const ttl = getTtlForPath(path);

  const cached = memoryCache.get(path);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "WEAO-3PService" },
    });

    const data = await upstream.json();
    const status = upstream.status;

    if (upstream.ok) {
      memoryCache.set(path, {
        data,
        status,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(data, {
      status,
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("WEAO proxy error:", error);
    return NextResponse.json(
      { error: "Failed to reach WEAO API" },
      { status: 502 }
    );
  }
}
This proxy gets you:

GET /api/weao/versions/current → WEAO /versions/current (Roblox versions) 
docs.weao.xyz

GET /api/weao/versions/future → WEAO /versions/future 
docs.weao.xyz

GET /api/weao/versions/past → WEAO /versions/past 
docs.weao.xyz

GET /api/weao/status/exploits → WEAO /status/exploits (all exploits) 
docs.weao.xyz

GET /api/weao/status/exploits/[exploit] → Single exploit status 
docs.weao.xyz

8.2 WEAO Client – src/lib/api/weao.ts
ts
Copy code
// src/lib/api/weao.ts

// Roblox version payload from /versions/current
export interface RobloxCurrentVersions {
  Windows: string;
  WindowsDate: string;
  Mac: string;
  MacDate: string;
  Android: string;
  AndroidDate: string;
  iOS: string;
  iOSDate: string;
}

// Exploit payload from /status/exploits (partial, we only map what we need)
export interface WeaoExploit {
  title: string;
  version: string;
  updatedDate: string;
  rbxversion: string;
  suncPercentage?: number;
  uncPercentage?: number;
  free: boolean;
  cost?: string;
  purchaselink?: string;
  websitelink?: string;
  discordlink?: string;
  platform: string;   // "Windows", "Mac", "Android", "iOS", etc.
  updateStatus: boolean;
  detected: boolean;
  keysystem?: boolean;
  // ...many more fields exist, see API_NOTES.md for full schema
}

const WEAO_PROXY_BASE = "/api/weao";

export async function getRobloxCurrentVersions(): Promise<RobloxCurrentVersions> {
  const res = await fetch(`${WEAO_PROXY_BASE}/versions/current`);

  if (!res.ok) {
    throw new Error("Failed to fetch Roblox versions");
  }

  return res.json();
}

export async function getAllExploitStatuses(): Promise<WeaoExploit[]> {
  const res = await fetch(`${WEAO_PROXY_BASE}/status/exploits`);

  if (!res.ok) {
    if (res.status === 429) {
      const data = await res.json();
      throw new Error(
        `WEAO rate limit. RemainingTime=${data?.rateLimitInfo?.remainingTime ?? "unknown"}`
      );
    }
    throw new Error(`Failed to fetch exploit statuses (${res.status})`);
  }

  return res.json();
}

export async function getExploitStatusByTitle(
  exploitTitle: string
): Promise<WeaoExploit> {
  // NOTE: WEAO uses a slug/identifier in the URL, not necessarily the human title.
  // You should store the correct WEAO ID per executor.
  const res = await fetch(
    `${WEAO_PROXY_BASE}/status/exploits/${encodeURIComponent(exploitTitle)}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch exploit status for ${exploitTitle}`);
  }

  return res.json();
}
Full field breakdown (including sunc, suncScrap, suncKey, etc.) lives in docs/API_NOTES.md, generated from the official WEAO docs.

🔌 Step 9: Data Hook – useExecutors
Goal:

Combine internal executor metadata (logo, long description, curated features) with WEAO live data (sUNC, Roblox version, updatedDate).

Always surface executors sorted by sUNC descending.

Create src/lib/hooks/useExecutors.ts:

ts
Copy code
import { useQuery } from "@tanstack/react-query";
import type { Executor } from "@/types/executor";
import {
  getAllExploitStatuses,
  type WeaoExploit,
} from "@/lib/api/weao";

function normalizeTitle(str: string) {
  return str.trim().toLowerCase();
}

function mapWeaoToExecutor(
  base: Executor,
  weao: WeaoExploit | undefined
): Executor {
  if (!weao) return base;

  const sunc = typeof weao.suncPercentage === "number"
    ? weao.suncPercentage
    : base.suncRating;

  // Map platform string into flags
  const platform = weao.platform.toLowerCase();
  const platforms = {
    windows: platform === "windows" || base.platforms.windows,
    mac: platform === "mac" || base.platforms.mac,
    mobile:
      platform === "android" ||
      platform === "ios" ||
      base.platforms.mobile,
    android: platform === "android" || base.platforms.android,
  };

  return {
    ...base,
    suncRating: sunc,
    status: {
      ...base.status,
      working: !!weao.updateStatus,
      robloxVersion: weao.rbxversion ?? base.status.robloxVersion,
      lastChecked: new Date(weao.updatedDate ?? base.status.lastChecked),
    },
    pricing: {
      ...base.pricing,
      type: weao.free ? "free" : "paid",
      rawCostString: weao.cost ?? base.pricing.rawCostString,
      purchaseUrl: weao.purchaselink ?? base.pricing.purchaseUrl,
    },
    links: {
      ...base.links,
      website: weao.websitelink ?? base.links?.website,
      discord: weao.discordlink ?? base.links?.discord,
    },
    platforms,
  };
}

export function sortExecutorsBySUNC(executors: Executor[]): Executor[] {
  return [...executors].sort((a, b) => {
    // 1) sUNC descending
    const sDiff = b.suncRating - a.suncRating;
    if (sDiff !== 0) return sDiff;

    // 2) working status (working first)
    if (a.status.working !== b.status.working) {
      return a.status.working ? -1 : 1;
    }

    // 3) name ascending
    return a.name.localeCompare(b.name);
  });
}

export function useExecutors() {
  return useQuery({
    queryKey: ["executors"],
    queryFn: async (): Promise<Executor[]> => {
      // Step 1: Get base executors from our own API (DB / static)
      const baseRes = await fetch("/api/executors");
      if (!baseRes.ok) {
        throw new Error("Failed to fetch base executors");
      }
      const baseExecutors: Executor[] = await baseRes.json();

      // Step 2: Get live WEAO data
      let weaoExecutors: WeaoExploit[] = [];
      try {
        weaoExecutors = await getAllExploitStatuses();
      } catch (error) {
        console.warn("WEAO fetch failed, falling back to base data", error);
        return sortExecutorsBySUNC(baseExecutors);
      }

      const byTitle = new Map<string, WeaoExploit>();
      for (const exploit of weaoExecutors) {
        byTitle.set(normalizeTitle(exploit.title), exploit);
      }

      const merged = baseExecutors.map((executor) => {
        const weao = byTitle.get(normalizeTitle(executor.name));
        return mapWeaoToExecutor(executor, weao);
      });

      return sortExecutorsBySUNC(merged);
    },
    // WEAO suggests not hammering their endpoints; 2–5 minutes is reasonable
    refetchInterval: 2 * 60 * 1000,   // 2 minutes
    staleTime: 2 * 60 * 1000,
  });
}
This hook guarantees the business rule: the final array is always sorted sUNC descending.

🏪 Step 10: Main Shop Table – ExecutorTable
Key rules:

Uses useExecutors() for data.

Uses useAppStore() for filters and search only.

Does not allow users to sort by other columns.

Platform pills that show Roblox build status live in a separate component (see PLATFORMPILLSQUICKREF.md), and are not used as filters.

Create src/components/shop/ExecutorTable.tsx:

ts
Copy code
"use client";

import { useMemo } from "react";
import { useExecutors, sortExecutorsBySUNC } from "@/lib/hooks/useExecutors";
import { useAppStore } from "@/lib/store/appStore";
import { ExecutorRow } from "./ExecutorRow";

export function ExecutorTable() {
  const { data: executors, isLoading, isError } = useExecutors();
  const {
    platformFilter,
    categoryFilter,
    searchQuery,
  } = useAppStore();

  const filteredExecutors = useMemo(() => {
    if (!executors) return [];

    let result = [...executors];

    // Platform filter (from FilterBar, NOT the platform status pills)
    if (platformFilter.length > 0) {
      result = result.filter((executor) =>
        platformFilter.some((platform) => executor.platforms[platform])
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (executor) => executor.category === categoryFilter
      );
    }

    // Search (name + description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (executor) =>
          executor.name.toLowerCase().includes(query) ||
          executor.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [executors, platformFilter, categoryFilter, searchQuery]);

  const sortedExecutors = useMemo(
    () => sortExecutorsBySUNC(filteredExecutors),
    [filteredExecutors]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-secondary">
        Loading executors...
      </div>
    );
  }

  if (isError || !executors) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-text-secondary mb-2">
          Failed to load executors.
        </div>
        <div className="text-text-muted text-sm">
          Please try again in a moment.
        </div>
      </div>
    );
  }

  if (sortedExecutors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-text-secondary mb-2">No executors found</div>
        <div className="text-text-muted text-sm">
          Try adjusting your filters or search query.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-background-elevated bg-background-surface">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-background-elevated bg-background-elevated/40">
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Executor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              sUNC
              <span className="ml-1 text-[10px] uppercase text-text-muted">
                (sorted)
              </span>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Platform
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Rating
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Price
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedExecutors.map((executor, index) => (
            <ExecutorRow key={executor.id} executor={executor} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
For responsive behavior (table → card on mobile) and component-level details (ExecutorRow, StatusIndicator, SuncBadge, etc.), see docs/key-kingdom-shop-components.md.

📱 Responsive Considerations
Desktop (≥ 1024px): full table visible.

Tablet (768–1023px): may hide less critical columns (e.g. last checked).

Mobile (< 768px):

Switch to card layout for executors.

Filters move into a bottom sheet or top drawer.

Platform status pills (Roblox versions) can sit at the top as a horizontally scrollable strip, but they never filter executors.

Behavioral details for pills and animations are in:

PLATFORMPILLSQUICKREF.md

ANIMATIONIMPLEMENTATIONGUIDE.md

STATUS_SYSTEM.md

🎯 Key Reminders
Marketplace first, status second. Every UX element should support buying decisions.

sUNC-only sorting in the main shop. Highest sUNC at the top, always.

Platform pills are status capsules, NOT filters.
Filters live in a dedicated FilterBar that uses its own chip components.

WEAO is upstream data. You transform WEAO’s fields into your internal Executor model.

Use the docs under /docs as the contract.
When in doubt, re-read:

APP_SPEC.md

CLAUDE.md

CLAUDECODEIMPLEMENTCHECKLIST.md

API_NOTES.md

STATUS_SYSTEM.md

Keep performance in mind. Respect WEAO rate limits, cache via proxy, and use React Query wisely.

Write strictly typed, accessible components. No any, semantic HTML, focus states, ARIA where needed.

🔍 Testing Checklist (Implementation-Level)
 npm run dev starts without runtime errors.

 / loads and displays the executor table.

 Executors are visibly sorted by sUNC descending.

 Filters work:

 Platform filter chips (NOT status pills).

 Category toggle (All / Reputable / Suspicious).

 Search box.

 Platform status pills:

 Expand/collapse works.

 Only one pill expanded at a time.

 Show Roblox version hash + “last updated” for each OS.

 Status indicator shows working/not working + Roblox version.

 Clicking “View Details” goes to /executor/[slug].

 Clicking “Buy Now” opens purchase link in a new tab.

 Layout works down to mobile.

 No noisy console errors.

 WEAO rate limit errors are handled gracefully (fallback to base data).

Summary:
Follow this file as your implementation backbone. Use the other docs in docs/ to fill in behavior, animations, and component details. The two non-negotiables are: platform pills = status only, and sUNC-first, sUNC-only sorting in the main marketplace table.

🚀 Implementation Order (Phased)
Phase 1: Foundation (Days 1–2)

✅ Create Next.js project & folder structure

✅ Configure Tailwind, fonts, base theme

✅ Implement utilities (cn, formatters)

✅ Add type definitions (executor, review)

✅ Set up Zustand store for filters/search only

Phase 2: Data Layer (Days 3–4)

✅ Implement WEAO proxy route (/api/weao/[...path])

✅ Implement /api/executors using static JSON or DB

✅ Implement useExecutors hook (merge + sUNC sort)

✅ Implement useRobloxVersions hook for platform status strip

Phase 3: Main Shop (Days 5–7)

✅ Implement PlatformStatusStrip + PlatformPill (status capsules only)

✅ Implement FilterBar (filters/search, no status pills)

✅ Implement ExecutorTable (desktop)

✅ Implement ExecutorRow with all columns

✅ Implement ExecutorCard for mobile

✅ Add Framer Motion animations + loading states

Phase 4: Detail Pages (Days 8–10)

✅ Build /executor/[slug] layout

✅ Add ExecutorHeader and ExecutorInfo sections

✅ Add screenshots/media gallery (optional placeholder first)

✅ Add sidebar with stats and “Buy Now” CTA

Phase 5: Reviews (Days 11–13)

✅ Add Review type and review storage (mock/DB)

✅ Implement ReviewList (read-only)

✅ Implement ReviewForm + API for submissions (Phase 2 feature)

✅ Add helpful / not helpful voting

Phase 6: Polish (Days 14–15)

✅ Responsive adjustments and QA

✅ Error handling and fallback states (including rate limits)

✅ Basic SEO metadata for main pages

✅ Final performance pass (bundle size, queries, caching)

📱 Responsive Considerations

Desktop (lg, ≥ 1024px)

Full table view with all columns visible.

Tablet (md, 768–1023px)

Same table but slightly tighter layout; optional column hiding for less critical data.

Mobile (sm, < 768px)

Table rows replaced with ExecutorCard layout.

Filters accessible via FilterBar (top) and optionally a filter drawer.

🔍 Testing Checklist

 Executors are always sUNC sorted (highest at top).

 Platform status pills show version hash + last updated per OS.

 Filters (platform/category/search) work without affecting pills.

 WEAO rate limiting handled gracefully (fallback messaging / cached data).

 Status indicators update after refresh intervals.

 Detail pages load correct executor data by slug.

 Purchase buttons open proper URLs.

 Layout is responsive and readable on mobile.

 Animations feel smooth and not janky.

 No references to “status tracker” as primary identity – always “executor marketplace / shop hub”.

📚 Documentation References

Use this file as the implementation starting point, and cross-reference:

docs/APP_SPEC.md – Complete product spec (marketplace-first)

docs/CLAUDE.md – AI assistant instructions and wording rules

docs/CLAUDECODEIMPLEMENTCHECKLIST.md – High-level Claude Code checklist

docs/STATUS_SYSTEM.md – Status system logic (platform health, incidents, banners)

docs/API_NOTES.md – WEAO API integration details

docs/PLATFORMPILLSQUICKREF.md – Platform pill behavior (status capsules)

docs/ANIMATIONIMPLEMENTATIONGUIDE.md – Animation patterns & Tailwind/Framer Motion guides

docs/keykingdomshopcomponents.md – Detailed component contracts for the shop UI

All WEAO endpoint URLs and field names in this file are aligned with the official WEAO API Reference pages for Roblox versions and Exploits.