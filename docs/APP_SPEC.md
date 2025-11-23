# Key-Kingdom.org – Complete Marketplace Specification

## Project Type: Executor Shop Hub & Marketplace

**Key-Kingdom.org is a comprehensive executor marketplace** – not just a status monitor.  
Users come here to **browse**, **compare**, **read reviews**, and **purchase** Roblox executors.

---

## Core Identity

### What We Are

- ✅ **Executor Marketplace** – Full-featured shop for browsing and buying executors
- ✅ **Product Comparison Hub** – Compare features, prices, safety ratings
- ✅ **Review Platform** – Community-driven ratings and reviews
- ✅ **Safety Resource** – sUNC ratings help users make safe choices
- ✅ **Purchase Gateway** – Direct links to buy executors

### What We’re NOT

- ❌ Just a status checker
- ❌ Simple list of executors
- ❌ Read-only information site

The **status system** is a **subsystem** that powers pills, badges, and warnings.  
The **product experience (shop)** is the main feature.

---

## Tech Stack

~~~yaml
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
Animation: Framer Motion
Data Fetching: React Query + Next.js fetch
State: Zustand (UI filters + preferences)
API: WEAO API (https://weao.xyz/api) via Next.js API routes
Database: TBD (PostgreSQL / MongoDB) for reviews + executors
~~~

---

## Design System

### Visual Theme

- **Dark cyber-console aesthetic** (Discord-inspired)
- **Color Palette**:
  - Background: `#0B0E11` (very dark blue-black)
  - Surface: `#151A21` (slightly lighter)
  - Elevated: `#1E2329` (hover / highlighted surfaces)
  - Accent / Primary: `#5865F2` (Discord blurple)
  - Success: `#43B581` (green - working / reputable)
  - Danger: `#F04747` (red - broken / dangerous)
  - Warning: `#FAA61A` (amber - suspicious / partial)
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#B9BBBE`

### Typography

~~~css
font-family:
  - Inter (primary UI)
  - JetBrains Mono (code / version hashes / tags)

Headings: 600–700 weight
Body:    400–500 weight
~~~

---

## Page Structure

### 1. Home Page (Main Shop)

**Layout**: Table view (desktop) with card layout fallback (mobile).

#### Table Columns (Desktop)

1. **Executor** (Logo + Name + brief description)
2. **sUNC Rating** (Large, prominent – **primary sort key**)
3. **Status** (Working / Not Working + Roblox version + last checked)
4. **Platform** (Row-level platform tags: Windows / Mac / Mobile / Android)
5. **Category** (Reputable / Suspicious badge)
6. **Rating** (Stars + review count)
7. **Price** (with currency)
8. **Actions** (View Details | Buy Now buttons)

#### Core Behavior

- **Ordering**
  - Table is **always sorted by sUNC descending** (highest safety on top).
  - There is **no user override for sorting**.
  - Column headers are not clickable for sort.

- **Filters & Search**
  - Search bar (name, description, features).
  - Category toggle:
    - Show: All / Reputable Only / Suspicious Only.
  - No platform-based filtering; **platform pills are status-only**.

- **Platform Status Pills (Header)**
  - Appears above the table:
    - Pills: [🖥️ Windows] [🍎 Mac] [📱 Android] [📱 iOS]
    - Each pill shows a **status label** (Stable / Partial / Broken).
    - When expanded:
      - Roblox version string for that platform
      - Last updated timestamp
      - Short status summary
  - Only **one pill expanded at a time**.
  - Pills are **informational**, not filters.

#### Above Table (Sketch)

~~~txt
┌───────────────────────────────────────────────────────────────────┐
│  🔍 Search executors...                                          │
│                                                                   │
│  Platform status: [🖥️ Windows • STABLE] [🍎 Mac • PARTIAL] ...    │
│                                                                   │
│  Show: [● All] [○ Reputable Only] [○ Suspicious Only]            │
└───────────────────────────────────────────────────────────────────┘
~~~

> Note: The pills here are **platform status capsules**, not filters.  
> They should never hide or filter executor rows.

#### Table Design (Sketch)

~~~txt
┌──────────────────────────────────────────────────────────────────────────────┐
│ Executor      │ sUNC │ Status    │ Platform │ Category   │ Rating │ Price   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🎯 Solara     │  98  │ ✅ Working│ 💻📱    │ ✓Reputable │ ⭐4.8  │ Free    │
│ Description   │      │ v2.690   │          │            │ (1.2k)│ [Buy]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🔥 Wave       │  95  │ ✅ Working│ 💻🍎    │ ✓Reputable │ ⭐4.6  │ $10     │
│ Description   │      │ v2.690   │          │            │ (856) │ [Buy]   │
└──────────────────────────────────────────────────────────────────────────────┘
~~~

On mobile, these rows are rendered as cards with the same information.

---

### 2. Executor Detail Page

**URL**: `/executor/[slug]`  
**Layout**: Split view (desktop), stacked (mobile)

#### Header

- Large executor logo
- Name + tagline
- sUNC rating badge
- Category badge (Reputable / Suspicious)
- Star rating + review count
- Status indicator (Working / Not Working + last update)

#### Main Content

1. **Overview**
   - Description
   - Key features list (3–7 bullet points)
   - Last updated timestamp

2. **Compatibility**
   - Supported platforms (icons + labels)
   - Roblox versions supported
   - System requirements

3. **Pricing**
   - Price (with currency)
   - Purchase options (one or more links)
   - Payment methods (icons / text)
   - Free trial info (if any)

4. **Screenshots / Media**
   - Image gallery
   - Optional video embeds (YouTube / etc.)

5. **Safety Information**
   - sUNC breakdown (what contributes to score)
   - Security features (key system, obfuscation, etc.)
   - Known issues / warnings

6. **Reviews Section**
   - Rating summary
   - Recent reviews (helpful-first order)
   - Filters: All / Positive / Negative
   - “Write Review” button (auth required)

#### Sidebar

- **Quick Actions**
  - [Buy Now] (primary CTA)
  - [Visit Website]
  - [Join Discord]
  - [Report Issue]
- **Stats Card**
  - Total reviews
  - Average rating
  - Uptime / reliability
  - Last status change
- **Similar Executors**
  - 3–4 recommended alternatives

---

### 3. Reviews System

#### Review Card (Sketch)

~~~txt
┌─────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ "Great executor!"                    │
│                                             │
│ by @username · 2 days ago · ✓ Verified     │
│                                             │
│ Review text here...                         │
│                                             │
│ 👍 Helpful (24) | 👎 Not Helpful (2)        │
└─────────────────────────────────────────────┘
~~~

#### Features

- Rating: 1–5 stars
- Optional title
- Review body (50–500 chars)
- Verified purchase indicator (when available)
- Helpful / Not Helpful voting
- Report abuse
- Moderation tools (flagged / removed states)

#### Rules

- Auth required to submit
- One review per executor per user
- User can edit or delete their own review
- Spam / offensive content is auto-flagged for moderation

---

### 4. Category Pages

- **Reputable Executors** (`/reputable`)
  - View showing only executors marked as `reputable`
  - Strong safety emphasis and trust indicators

- **Suspicious Executors** (`/suspicious`)
  - Warning banner at top
  - Risk indicators
  - User reports summary
  - “Proceed with caution” messaging

---

### 5. About / Info Pages

- **About** (`/about`)
  - What is Key-Kingdom?
  - How safety is rated (sUNC summary)
  - High-level usage policy
  - Contact or support links

- **Safety Guide** (`/safety`)
  - How to use executors as safely as possible
  - Understanding sUNC
  - Common red flags
  - Best practices

- **FAQ** (`/faq`)
  - Common how-tos
  - Troubleshooting
  - Payment / purchase help

---

## Data Models

### Executor

~~~ts
interface Executor {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  logo: string;
  images?: string[];

  // Safety & Status
  suncRating: number; // 0-100
  category: "reputable" | "suspicious";
  status: {
    working: boolean;
    robloxVersion: string;
    lastChecked: Date;
    lastStatusChange?: Date;
  };

  // Platform Support
  platforms: {
    windows: boolean;
    mac: boolean;
    mobile: boolean;
    android?: boolean;
  };

  // Commerce
  pricing: {
    type: "free" | "paid" | "freemium";
    price?: number;
    currency?: string;
    purchaseUrl: string;
    freeTrial?: boolean;
  };

  // Social
  rating: {
    average: number; // 0-5
    count: number;
  };
  links?: {
    website?: string;
    discord?: string;
    documentation?: string;
  };

  // Features
  features: string[];
  keyFeatures?: string[]; // Top 3–5 highlights

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  popular?: boolean; // Featured / popular badge
}
~~~

### Review

~~~ts
interface Review {
  id: string;
  executorId: string;
  userId: string;
  username: string;

  rating: number; // 1-5
  title?: string;
  content: string;

  verifiedPurchase: boolean;

  helpful: number;
  notHelpful: number;

  createdAt: Date;
  updatedAt?: Date;

  status: "published" | "flagged" | "removed";
  moderatorNote?: string;
}
~~~

### User

~~~ts
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;

  role: "user" | "moderator" | "admin";

  reviews: Review[];
  helpfulVotes: string[]; // Review IDs

  createdAt: Date;
  verified: boolean;
}
~~~

---

## API Integration

### WEAO API

**Base URL**: `https://weao.xyz/api`  
**Required Header**: `User-Agent: WEAO-3PService`

Key endpoints:

- `GET /versions/current`
  - Returns current Roblox versions for Windows, Mac, Android, iOS
- `GET /versions/future`
  - Returns upcoming versions
- `GET /versions/past`
  - Returns previous versions
- `GET /status/exploits`
  - Returns an array of exploit metadata (status, platform, pricing, etc.)
- `GET /status/exploits/[exploit]`
  - Returns a single exploit’s status

**Update Strategy:**

- Versions: ~5-minute polling
- Exploit status: ~2-minute polling (with smart backoff during rate limits)
- All calls proxied through Next.js API routes

> See `docs/api_notes.md` for detailed shapes and error-handling patterns.

### Internal API Routes

- `/api/weao/versions/current` – Proxy to WEAO versions
- `/api/weao/status/exploits` – Proxy to WEAO exploit status
- `/api/executors`
  - `GET` – List all executors
  - `POST` – Admin create
- `/api/executors/[slug]`
  - `GET` – Single executor
  - `PATCH` – Admin update
- `/api/reviews`
  - `POST` – Submit review
- `/api/reviews/[id]/vote`
  - `PATCH` – Helpful / Not helpful vote
- `/api/search`
  - `GET` – Query executors

---

## State Management

### React Query

- Handles server data: executors, reviews, status, versions
- Caching & background refresh
- Stale times tuned to WEAO polling intervals
- Global `QueryClient` configured in app providers

### Zustand Store

UI-level state only (no server duplication):

~~~ts
interface FilterState {
  categoryFilter: "all" | "reputable" | "suspicious";
  searchQuery: string;
}

interface AppStore extends FilterState {
  setCategoryFilter: (category: FilterState["categoryFilter"]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}
~~~

> ❗ No `platformFilter`, no `sortBy`, no `sortOrder`.  
> Sorting is **fixed** to sUNC descending; platform pills are status-only.

---

## Animations

### Page Transitions

~~~ts
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};
~~~

### Table Row Entrance

~~~ts
const rowVariants = {
  hidden: (i: number) => ({ opacity: 0, x: -20 }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};
~~~

### Status Update Pulse

~~~ts
const pulseVariants = {
  normal: { scale: 1 },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.5 },
  },
};
~~~

More detailed animation patterns live in `docs/animationimplementationguide.md`.

---

## Responsive Breakpoints

~~~css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
~~~

### Behavior

- **Mobile (< 768px)**
  - Filters stack vertically
  - Table becomes **card layout**
  - Bottom sheet for filters (optional)
- **Tablet (768px–1024px)**
  - Condensed table, possibly hide low-priority columns
- **Desktop (> 1024px)**
  - Full table view
  - Hover states, tooltips, full columns

---

## Performance & SEO

### Performance

1. **Code Splitting**
   - Route-based
   - Dynamic imports for heavy components
2. **Image Optimization**
   - Next.js `<Image>`
   - WebP where possible
   - Lazy loading
3. **Caching**
   - React Query for API data
   - CDN cache headers for static assets
4. **Bundle Size**
   - Minimal dependencies
   - Tree-shaking

### SEO & Metadata

Each page should include:

- Unique `<title>`
- Meta description
- Open Graph + Twitter Card tags
- JSON-LD schema:
  - Product schema for executor detail pages
- Canonical URLs
- Sitemap & robots.txt

---

## Accessibility & Security

### Accessibility

- Semantic HTML layout
- ARIA attributes where needed
- Keyboard navigation
- Visible focus states
- Adequate color contrast (WCAG AA)
- Alt text for icons & images

### Security

- Safe authentication (when added) with CSRF and secure cookies
- Input sanitization (especially reviews)
- XSS and injection defenses
- Rate limiting on write endpoints
- Review moderation tools

---

## Analytics & Success Metrics

Track:

- Page views, sessions
- Table load time
- Search and filter usage
- Click-through on “Buy Now”
- Review submission rate
- Preference for high-sUNC executors

Key success metrics:

- **User Engagement** – Time on site, pages per visit
- **Conversion** – Purchase click-through rates
- **Trust** – Percentage of users choosing high-sUNC executors
- **Growth** – Monthly active users, executor catalog size

---

> **Core mantra**:  
> **Shop hub first, status tracker second.**  
> Pills show platform health; they never filter.  
> sUNC is always the primary (and only) sort key.
