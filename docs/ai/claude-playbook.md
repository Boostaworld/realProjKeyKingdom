# Instructions for AI Assistants Working on Key-Kingdom.org

## 🎯 Project Identity

Key-Kingdom.org is a **comprehensive executor marketplace** — a shop hub where users browse, compare, review, and purchase Roblox executors.  
This is **NOT** a simple status tracker or read-only website.

> Always think: **“Amazon-style shop hub for executors”**, not “status page”.

---

## Core Principles

### 1. Shop Hub First, Status Tracker Second
- Every feature should facilitate **informed purchasing decisions**
- **Commerce is the primary goal**
- Status tracking **supports** the shopping experience (it is not the product)

### 2. Safety & Trust
- **sUNC rating is the most important metric**
- **Default and only sort** on the main list is **sUNC descending (highest first)**
- Category badges (**Reputable / Suspicious**) are prominent
- Reviews build trust and transparency
- Status system exists to help people avoid broken/unsafe executors

### 3. User Experience
- Clean, modern **Discord-like dark** aesthetic
- Table view for **information density** on desktop
- Smooth animations that **enhance, not distract**
- Mobile converts table → card layout, but keeps a **shop** feeling (not a dashboard)

---

## 🚫 Common Mistakes to Avoid

### Don't Say:
- ❌ "Status monitoring platform"
- ❌ "Executor tracker"
- ❌ "Information website"
- ❌ "Database of executors"

### Do Say:
- ✅ "Executor marketplace"
- ✅ "Shop hub"
- ✅ "E-commerce platform for executors"
- ✅ "Purchase and review platform"

> If you’re about to describe the site, run this mental check:  
> **“Does this sound like a store?”** If not, rewrite it.

---

## 📊 Main View is a TABLE (sUNC-Only Sort)

The home page displays executors in a **table layout** similar to inject.today, **not** in cards (except on small mobile where it becomes card-like for readability).

### Table Columns (in order):
1. **Executor** – Logo + Name + Brief description
2. **sUNC** – Large, prominent safety rating (0–100)
3. **Status** – Working/Not Working + Roblox version
4. **Platform** – Platform tags (PC/Mac/Mobile/Android)
5. **Category** – Badge (Reputable/Suspicious)
6. **Rating** – Stars (1–5) + review count
7. **Price** – Currency formatted, “Free” if applicable
8. **Actions** – “View Details” and “Buy Now” buttons

### Sorting Rules (CRITICAL)

**On the main marketplace list:**

- ✅ Always sort by **sUNC descending**  
- ✅ Tie-breakers:
  1. Working status (working first)
  2. Name (A–Z)
- ❌ No user-selectable sorting by price/name/rating on the main list  
  (Those can be added later as **secondary, clearly labeled tools**, but the **core mental model** is “sorted by safety”.)

> If you implement or describe sorting, you must respect:  
> **“Highest sUNC at the top, always.”**

---

## 🟦 Platform Pills = Status Capsules (NOT Filters)

### Mental Model

**Old (Deprecated):**
- Pills filtered which executors were shown  

**New (Correct):**
- Pills are **status/info capsules only**
- They show **Roblox build information per platform**
- They **do not filter** executors at all

### What Platform Pills Do

- Show **platform icon + name** (e.g., Windows, Mac, Android, iOS)
- Show **current platform status**: Stable / Partial / Broken
- On expand:
  - Roblox **version hash or semantic version** for that OS
  - **Last updated timestamp** (e.g., “2 minutes ago”)
  - Short status message (e.g., “Most Windows executors working”)

**Behavior:**
- Only **one pill expanded at a time**
- Smooth expand/collapse animation (Framer Motion)
- Pills **never** filter executors; they are **purely informational**
- Executor rows/cards show their own platform support separately

When writing or generating code:

- ✅ Treat pills as **status display + expandable detail**  
- ❌ Do **not** add `platformFilter` logic or connect them to executor visibility

---

## 🎨 Design System (High-Level)

### Colors

```ts
background: {
  DEFAULT: "#0B0E11",      // Main background
  surface: "#151A21",      // Cards, table rows
  elevated: "#1E2329",     // Hover states
}

primary: "#5865F2"         // Discord blurple - CTAs
success: "#43B581"         // Green - working status
danger: "#F04747"          // Red - not working
warning: "#FAA61A"         // Amber - suspicious category
Typography
Headings: Inter, 600–700 weight

Body: Inter, 400–500 weight

Code/Tags: JetBrains Mono

Spacing
Generous whitespace

Consistent padding (4px multiples)

Clear visual hierarchy: headings > labels > body

🔧 Technical Guidelines
Data Flow (Conceptual)
text
Copy code
User Action
  → UI Component
    → Zustand Store (UI filters, view mode, search)
      → React Query (server data: executors, status, reviews)
        → WEAO API + Internal APIs
React Query: server state (executors, status, reviews, versions)

Zustand: UI state (search query, category filter, expanded platform pill, view mode)

Never duplicate the same state across both.

WEAO API (Conceptual Use)
Use WEAO for:

Roblox versions per platform

Executor working / not working status

Features like sUNC/UNC, etc.

Always go through Next.js API routes on the server to:

Attach required User-Agent

Avoid CORS issues

Add caching

(Detailed endpoints and caching strategies live in docs/api_notes.md.)

Component Structure
ts
Copy code
// Atomic components in /components/ui
Button, Badge, Input, Card, StatusDot, etc.

// Feature components in /components/shop, /components/executor
ExecutorTable, ExecutorRow, PlatformStatusPills, ReviewList, FilterBar, etc.

// Layout components in /components/layout
Header, Footer, Navigation, etc.
📝 When Writing Code
Always Include
Strong TypeScript types

No any — use proper interfaces and types from src/types/*

Clean imports

Use @/* import alias, no deep relative mess

Error handling

Try/catch, fallbacks, friendly error states

Loading states

Skeletons or shimmer states, not blank screens

Accessibility

Semantic HTML, ARIA where needed, focus management

Comments

Only for non-obvious logic; don’t narrate trivial code

Component Pattern Example
tsx
Copy code
"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";

interface ComponentProps {
  // clear, explicit props
}

export function Component({}: ComponentProps) {
  // hooks at top

  // derived state & memoized values

  // handlers

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl bg-background-surface p-4")}
    >
      {/* JSX goes here */}
    </motion.div>
  );
}
🎭 Animation Guidelines
Use Framer Motion for meaningful animations:

Page transitions

Table row entrance (stagger)

Status changes (pulse / subtle scale)

Pill expand/collapse

Button hover/tap feedback

Principles
Subtle – no noisy, distracting movements

Fast – ~200–300ms for most interactions

Purposeful – animation should convey state (loading, change, emphasis)

Performant – animate transform and opacity, not width/height directly

Example Row Variants
ts
Copy code
const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};
🛍️ Commerce Features
Purchase Flow
User sees executor in table (or card on mobile)

Clicks “View Details” or “Buy Now”

“Buy Now” → external purchase link (new tab)

Detail page shows:

Rich description, features, screenshots, safety info

Prominent “Buy Now” CTA

After purchase, user can leave a review (Phase 2+)

Review System (Conceptual)
One review per executor per user

1–5 star rating (required)

Optional text review (50–500 chars)

Verified purchase badge (when possible)

Helpful / Not Helpful voting

Moderation tools for admins (flag, hide, note)

Implementation specifics live in:

docs/app_spec.md

docs/keykingdomshopcomponents.md

docs/projectinit.md

📱 Responsive Breakpoints
css
Copy code
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop - main target */
xl: 1280px  /* Large desktop */
Mobile
Table → card layout

Filters compress into drawer / section above list

Touch-friendly tap targets (≥44×44px)

Still feels like a store, not a JSON viewer

🔍 SEO Requirements
Every page needs:

Unique <title>

Meta description

Open Graph tags (title, description, image)

JSON-LD structured data

Product schema for executor detail pages

Canonical URL

Proper heading hierarchy (h1 → h2 → h3)

SEO details and examples live in docs/app_spec.md.

🎯 Feature Priority (for Claude & Co.)
High Priority (MVP)
✅ Executor table with all columns

✅ sUNC-only default sorting (safety-first ordering)

✅ Platform status pills (NOT filters) at top

✅ Search functionality

✅ Detail pages

✅ WEAO API integration via Next.js API routes

✅ Review display

✅ Purchase links

Medium Priority (Phase 2)
Review submission

User authentication

Advanced filters (e.g., price ranges, features)

Persisted preferences (view mode, search query)

Favorites / Watchlist

Low Priority (Phase 3+)
Vendor dashboard

Public API

Mobile apps

Email notifications

Community / forum

🐛 Debugging Tips
“Executors not loading”
Check WEAO proxy / API health

Verify React Query and API route configuration

Look for network errors in dev tools

“Status seems stale”
Check polling intervals + caching strategy

Confirm API rate limits not exceeded

Validate time formatting (UTC vs local display)

“Pills acting like filters”
You probably wired pill clicks to filter logic

Remove connection to executor visibility

Keep pills in a separate UI concern from filters

“Sorting looks wrong”
Ensure main list is sorted by sUNC descending

Only use other fields as tie-breakers, not primary sort keys

📚 Reference Documentation
When implementing features, always refer to:

docs/app_spec.md – Complete product specification

docs/projectinit.md – Project setup & implementation guide

docs/keykingdomshopcomponents.md – Component-level details

docs/platformpillsquickref.md – Platform pill behavior

docs/status_system.md – Status calculation & incident logic

docs/api_notes.md – WEAO API integration details

🤝 Working with Claude Code
When Starting a New Feature
Use prompts like:

text
Copy code
I need to implement [feature name] for Key-Kingdom.

Context: This is an executor marketplace (shop hub), not just a status tracker.
The feature must:
- Keep the main executor list sorted by sUNC (highest first)
- Treat platform pills as status capsules, NOT filters
- Match the dark, Discord-like aesthetic

Please reference:
- docs/app_spec.md for overall design
- docs/projectinit.md for setup patterns
- docs/keykingdomshopcomponents.md for component patterns
- docs/api_notes.md for WEAO usage
Include:

The file(s) you’re working on

The relevant code snippets

What you’ve tried already

Any errors or weird behavior

⚠️ Critical Reminders (TL;DR)
This is a SHOP — executor marketplace first, status viewer second

Table view is the primary layout on desktop

sUNC is the only primary sort on the main list (highest at top)

Platform pills are status-only, never filters

Dark Discord-like aesthetic everywhere

Reviews & safety are central to trust

WEAO powers real-time status; always go via API routes

Performance & UX matter: fast, smooth, understandable

📊 Success Metrics
Track and optimize for:

Time to first meaningful paint

Table load time from cold start

Filter/search responsiveness

Click-through rate on “Buy Now”

Review submission and engagement

Mobile usage & bounce rate

Accessibility scores

Remember:
Key-Kingdom is where users come to buy executors safely, not just to see what’s broken today.
Every design, copy, and implementation choice should reinforce that.