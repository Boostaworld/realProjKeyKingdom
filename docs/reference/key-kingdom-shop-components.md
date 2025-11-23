# Key-Kingdom Shop Components Documentation

This document provides detailed specifications for all **shop-related UI components** in the Key-Kingdom executor marketplace.

> **Critical Business Rules (must be respected by all components):**
> 1. **This is an executor marketplace / shop hub**, not a simple status tracker.
> 2. The **main shop view is a table** of executors (desktop-first).
> 3. The **executor list is always sorted by sUNC descending** (highest safety at top).  
>    - Sorting is handled centrally (e.g. `sortExecutorsBySUNC`) and reused everywhere.
> 4. **Platform pills are *status capsules only***:
>    - They live in the **status strip** (global platform health area).
>    - They show **Roblox version hash + last updated** for each platform.
>    - They **do not filter** the executor list.
> 5. Any **platform filtering** in the shop uses **separate filter chips/buttons**, not the status pills.

---

## 🏪 Core Shop Components

### 1. `ExecutorTable` Component

**Purpose:**  
Main **marketplace table** displaying all executors with filters, search, and **sUNC-first sorting**.

**File:**  
`src/components/shop/ExecutorTable.tsx`

**Props:**  
None (it uses global/filter state and data hooks).

**Data Sources:**

- `useExecutors()` (see `docs/API_NOTES.md` + `docs/STATUS_SYSTEM.md`):
  - Merges internal executor metadata with WEAO live status & sUNC.
  - Always returns the list sorted by **sUNC descending** by default.
- `useAppStore()` (Zustand UI store):
  - manages **filters and search only**:
    - `platformFilter: Platform[]`
    - `categoryFilter: "all" | "reputable" | "suspicious"`
    - `searchQuery: string`

**Key Behavior:**

- Never re-sorts by other columns; it only:
  - Applies filters (platform/category).
  - Applies search (name + description).
  - Then relies on `sortExecutorsBySUNC()` to maintain sUNC-first ordering.
- Shows **desktop table view** on larger screens and can delegate to **card view** on mobile (via `ExecutorCard` pattern in this doc).

**Code Structure (simplified):**

```ts
export function ExecutorTable() {
  const { data: executors, isLoading, isError } = useExecutors();
  const { platformFilter, categoryFilter, searchQuery } = useAppStore();

  // 1. Filter
  const filtered = useMemo(() => {
    if (!executors) return [];

    let result = [...executors];

    if (platformFilter.length > 0) {
      result = result.filter((executor) =>
        platformFilter.some((platform) => executor.platforms[platform])
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (executor) => executor.category === categoryFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (executor) =>
          executor.name.toLowerCase().includes(q) ||
          executor.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [executors, platformFilter, categoryFilter, searchQuery]);

  // 2. Sort — sUNC only
  const sortedExecutors = useMemo(
    () => sortExecutorsBySUNC(filtered),
    [filtered]
  );

  // 3. Render loading/empty/error states then the table
}
Styling:

tsx
Copy code
// Table container
<div className="w-full overflow-x-auto rounded-lg border border-background-elevated bg-background-surface">

// Table
<table className="w-full border-collapse">

// Header cells
<th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary border-b border-background-elevated">

// Sorted sUNC column indicator
<th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
  sUNC
  <span className="ml-1 text-[10px] uppercase text-text-muted">(sorted)</span>
</th>
Animations:

Use Framer Motion on ExecutorRow for staggered row entrances:

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
2. ExecutorRow Component
Purpose:
Individual row in the marketplace table, representing one executor.

File:
src/components/shop/ExecutorRow.tsx

Props:

ts
Copy code
interface ExecutorRowProps {
  executor: Executor;
  index: number; // for staggered animation
}
Columns (desktop):

Executor (min-width ~250px)

Logo (40×40px)

Name (bold)

Brief description (muted, single line)

sUNC

Uses SuncBadge (large number + label, color-coded).

Status

Uses StatusIndicator:

Working / Not Working

Roblox version (from WEAO via rbxversion)

Last checked (relative time).

Platform

Uses display-mode PlatformPills (compact icon mode, NOT filters).

Category

Uses CategoryBadge (Reputable vs Suspicious).

Rating

Uses StarRating (average + count).

Price

Formatted using formatPrice.

Actions

“View Details” (ghost)

“Buy Now” (primary)

Both are click targets; row-click navigates to details.

Interaction Rules:

Clicking on the row (not the buttons) navigates to /executor/[slug].

Clicking on the buttons:

Stops propagation (e.stopPropagation()).

“View Details”: router.push("/executor/${executor.slug}").

“Buy Now”: opens executor.pricing.purchaseUrl in new tab.

Example Implementation:

tsx
Copy code
export function ExecutorRow({ executor, index }: ExecutorRowProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/executor/${executor.slug}`);
  };

  const handleBuyNow = () => {
    if (!executor.pricing.purchaseUrl) return;
    window.open(executor.pricing.purchaseUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="border-b border-background-elevated hover:bg-background-surface cursor-pointer transition-colors"
      onClick={handleViewDetails}
    >
      {/* Executor Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src={executor.logo}
            alt={executor.name}
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <div className="font-semibold text-text-primary">
              {executor.name}
            </div>
            <div className="text-sm text-text-muted line-clamp-1">
              {executor.description}
            </div>
          </div>
        </div>
      </td>

      {/* sUNC Column */}
      <td className="px-4 py-3">
        <SuncBadge rating={executor.suncRating} />
      </td>

      {/* Status Column */}
      <td className="px-4 py-3">
        <StatusIndicator status={executor.status} />
      </td>

      {/* Platform Column (display-only pills) */}
      <td className="px-4 py-3">
        <PlatformPills platforms={executor.platforms} compact />
      </td>

      {/* Category Column */}
      <td className="px-4 py-3">
        <CategoryBadge category={executor.category} />
      </td>

      {/* Rating Column */}
      <td className="px-4 py-3">
        <StarRating
          rating={executor.rating.average}
          count={executor.rating.count}
        />
      </td>

      {/* Price Column */}
      <td className="px-4 py-3">
        <div className="font-semibold text-text-primary">
          {formatPrice(executor.pricing.price, executor.pricing.currency)}
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-3">
        <div
          className="flex items-center gap-2 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="sm" onClick={handleViewDetails}>
            View Details
          </Button>
          <Button variant="primary" size="sm" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}
3. FilterBar Component
Purpose:
Search and filter controls above the table.

Note: This component uses its own interactive chips/buttons for filters.
Platform pills from the status system are not used here.

File:
src/components/shop/FilterBar.tsx

Props:
None (uses useAppStore()).

Features:

Search input (searchQuery with debounce).

Platform filter chips (e.g. PC / Mac / Mobile).

Category radio buttons (All / Reputable Only / Suspicious Only).

Clear all filters button with active count.

Layout:

text
Copy code
┌─────────────────────────────────────────────────────────┐
│ 🔍 Search executors...     [PC] [Mac] [Mobile]          │
│                                                         │
│ Show: (•)All  ( )Reputable Only  ( )Suspicious Only     │
│                                         Clear Filters × │
└─────────────────────────────────────────────────────────┘
Implementation Sketch:

tsx
Copy code
export function FilterBar() {
  const {
    platformFilter,
    categoryFilter,
    searchQuery,
    setPlatformFilter,
    setCategoryFilter,
    setSearchQuery,
    resetFilters,
  } = useAppStore();

  const [input, setInput] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(input), 300);
    return () => clearTimeout(t);
  }, [input, setSearchQuery]);

  const togglePlatform = (platform: Platform) => {
    const next = platformFilter.includes(platform)
      ? platformFilter.filter((p) => p !== platform)
      : [...platformFilter, platform];

    setPlatformFilter(next);
  };

  const activeFilterCount =
    platformFilter.length +
    (categoryFilter !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-background-surface rounded-lg p-4 mb-6 space-y-4">
      {/* Search + platform filter chips */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          type="search"
          placeholder="Search executors..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />

        <div className="flex gap-2">
          {(["windows", "mac", "mobile"] as Platform[]).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                platformFilter.includes(platform)
                  ? "bg-primary text-white"
                  : "bg-background-elevated text-text-secondary hover:bg-background-elevated/80"
              )}
            >
              {/* Simple text; icons optional */}
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category radios + Clear Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">Show:</span>

          {(["all", "reputable", "suspicious"] as const).map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="radio"
                name="category"
                checked={categoryFilter === category}
                onChange={() => setCategoryFilter(category)}
                className="accent-primary"
              />
              <span className="capitalize">
                {category === "all" ? "All" : `${category} Only`}
              </span>
            </label>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
            <Badge variant="default" className="ml-2">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
4. PlatformPills (Display Mode in Table Rows)
Important Distinction:
There are two conceptual uses of “platform pills”:

Global platform status capsules (see STATUS_SYSTEM.md & PLATFORMPILLSQUICKREF.md) – these live in their own component (e.g. PlatformStatusStrip) and show Roblox version + status per OS.

Per-executor platform tags shown inside table rows/cards – these are display-only tags indicating which platforms that executor supports.

This section describes #2 (per-executor tags in rows/cards).

File (per-executor tags):
src/components/shop/PlatformPills.tsx

Props:

ts
Copy code
interface PlatformPillsProps {
  platforms: {
    windows: boolean;
    mac: boolean;
    mobile: boolean;
    android?: boolean;
  };
  compact?: boolean;   // compact icon-only style for table
}
Behavior:

For table rows (compact={true}), shows a tight row of small icons for each supported platform.

These do not filter; they are just a visual hint.

Example:

tsx
Copy code
const platformConfig = {
  windows: { label: "Windows" },
  mac: { label: "Mac" },
  mobile: { label: "Mobile" },
  android: { label: "Android" },
};

export function PlatformPills({ platforms, compact = false }: PlatformPillsProps) {
  const supported = Object.entries(platforms)
    .filter(([, supported]) => supported)
    .map(([key]) => key as keyof typeof platformConfig);

  if (compact) {
    return (
      <div className="flex gap-1">
        {supported.map((platform) => (
          <div
            key={platform}
            className="h-6 px-2 rounded-full bg-background-elevated text-[11px] text-text-secondary flex items-center"
          >
            {platformConfig[platform].label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {supported.map((platform) => (
        <div
          key={platform}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-elevated text-sm text-text-secondary"
        >
          <span>{platformConfig[platform].label}</span>
        </div>
      ))}
    </div>
  );
}
For the status capsules showing Roblox version and “Stable/Partial/Broken” per platform, see docs/PLATFORMPILLSQUICKREF.md and docs/ANIMATIONIMPLEMENTATIONGUIDE.md (those are separate components: PlatformPill + PlatformSelector / PlatformStatusStrip, and again they are status-only, not filters).

5. SuncBadge Component
Purpose:
Display sUNC safety rating with label and color coding.

File:
src/components/shared/SuncBadge.tsx

Props:

ts
Copy code
interface SuncBadgeProps {
  rating: number; // 0–100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}
Color Coding:

90–100 → “Very Safe” – bright green

75–89 → “Safe” – green

60–74 → “Moderate” – yellow

40–59 → “Risky” – orange

0–39 → “Dangerous” – red

Implementation:

tsx
Copy code
export function SuncBadge({
  rating,
  size = "md",
  showLabel = true,
}: SuncBadgeProps) {
  const { label, color } = formatSuncRating(rating);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "font-bold tabular-nums",
          sizeClasses[size],
          color
        )}
      >
        {rating}
      </div>
      {showLabel && (
        <div className={cn("text-text-muted font-medium", labelSizes[size])}>
          {label}
        </div>
      )}
    </div>
  );
}
6. StatusIndicator Component
Purpose:
Show executor-level status, including WEAO-derived fields.

File:
src/components/shared/StatusIndicator.tsx

Props:

ts
Copy code
interface StatusIndicatorProps {
  status: ExecutorStatus;
  compact?: boolean;
}
Displays:

Working / Not Working (icon + text).

Roblox version string (e.g. version-31fc142272764f02).

Last checked (relative time; hidden in compact mode).

Example:

tsx
Copy code
export function StatusIndicator({ status, compact = false }: StatusIndicatorProps) {
  const { working, robloxVersion, lastChecked } = status;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <StatusDot status={working ? "working" : "broken"} size="sm" />
        <span
          className={cn(
            "font-medium",
            working ? "text-success" : "text-danger"
          )}
        >
          {working ? "Working" : "Not Working"}
        </span>
      </div>

      {!compact && (
        <>
          <div className="text-sm text-text-muted">
            v{robloxVersion}
          </div>
          <div className="text-xs text-text-muted">
            {formatRelativeTime(lastChecked)}
          </div>
        </>
      )}
    </div>
  );
}
The pulsing StatusDot animation is defined in docs/ANIMATIONIMPLEMENTATIONGUIDE.md.

7. CategoryBadge Component
Purpose:
Display executor category: Reputable vs Suspicious.

File:
src/components/shared/CategoryBadge.tsx

Props:

ts
Copy code
interface CategoryBadgeProps {
  category: "reputable" | "suspicious";
}
Implementation:

tsx
Copy code
export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = {
    reputable: {
      label: "Reputable",
      variant: "success" as const,
    },
    suspicious: {
      label: "Suspicious",
      variant: "warning" as const,
    },
  };

  const { label, variant } = config[category];

  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      {label}
    </Badge>
  );
}
8. StarRating Component
Purpose:
Display (and optionally allow interaction with) star-based ratings.

File:
src/components/ui/StarRating.tsx

Props:

ts
Copy code
interface StarRatingProps {
  rating: number;      // 0–5; decimals allowed
  count?: number;      // review count
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}
Example:

tsx
Copy code
export function StarRating({
  rating,
  count,
  interactive = false,
  onChange,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const displayRating = interactive && hoverRating ? hoverRating : rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayRating;
          const partial =
            star === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={cn(
                interactive &&
                  "cursor-pointer hover:scale-110 transition-transform"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  filled && "fill-warning text-warning",
                  partial && "fill-warning/50 text-warning"
                )}
              />
            </button>
          );
        })}
      </div>

      {typeof count === "number" && (
        <span className="text-sm text-text-muted">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
9. ExecutorCard (Mobile Layout)
Purpose:
Mobile-friendly card variant of an executor row.

Usage:
Used when viewport < md. It shows the same information as the row, but stacked vertically.

Example Implementation:

tsx
Copy code
function ExecutorCard({ executor }: { executor: Executor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-surface rounded-lg p-4 space-y-3 border border-background-elevated"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Image
          src={executor.logo}
          alt={executor.name}
          width={48}
          height={48}
          className="rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">
            {executor.name}
          </h3>
          <p className="text-sm text-text-muted line-clamp-2">
            {executor.description}
          </p>
        </div>
        <SuncBadge rating={executor.suncRating} size="sm" showLabel={false} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-text-muted">Status</div>
          <StatusIndicator status={executor.status} compact />
        </div>
        <div>
          <div className="text-text-muted">Rating</div>
          <StarRating rating={executor.rating.average} size="sm" />
        </div>
      </div>

      {/* Platform & Category */}
      <div className="flex items-center gap-2">
        <PlatformPills platforms={executor.platforms} compact />
        <CategoryBadge category={executor.category} />
      </div>

      {/* Price & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-background-elevated">
        <div className="font-semibold text-lg text-text-primary">
          {formatPrice(executor.pricing.price)}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Details
          </Button>
          <Button variant="primary" size="sm">
            Buy
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
📱 Responsive Behavior Summary
Desktop (≥ 1024px)

Full ExecutorTable with all columns.

Hover states on rows.

Tablet (768–1023px)

Same table with slightly reduced padding.

Optionally hide least important columns.

Mobile (< 768px)

ExecutorTable can switch to mapping sortedExecutors -> ExecutorCard.

Filters accessible via FilterBar (top) or a filter sheet.

🎨 Animation Patterns
Table row entrance: staggered (rowVariants).

Status dot pulse and ring animation: see docs/ANIMATIONIMPLEMENTATIONGUIDE.md.

Filter changes can cause subtle fade-out/in (optional).

✅ Component Checklist
When implementing shop components, ensure:

 The executor list is always sUNC-sorted via shared helper.

 Platform pills used for status (Roblox versions) are not reused as filters.

 Filter UI uses separate, clearly-named components (FilterBar, filter chips).

 Types are fully defined (no any).

 Components are responsive down to mobile.

 Loading and empty states are implemented.

 Animations are smooth and subtle.

 Accessibility: semantic HTML, focus states, ARIA where appropriate.

 No conflicting descriptions (always call this an executor marketplace / shop hub).

This file is meant to be used together with:

docs/APP_SPEC.md – full marketplace spec

docs/CLAUDE.md – AI/assistant instructions

docs/CLAUDECODEIMPLEMENTCHECKLIST.md – build checklist

docs/PLATFORMPILLSQUICKREF.md – status pill behavior

docs/ANIMATIONIMPLEMENTATIONGUIDE.md – animation details

docs/STATUS_SYSTEM.md – status calculation & warnings

docs/API_NOTES.md – WEAO API integration details
