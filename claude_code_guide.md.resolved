# Phase 1 & 2 Implementation Guide for Claude Code

**Objective**: Transform Key-Kingdom from table layout to card grid with loading animation

**Estimated Time**: 5-7 hours  
**Files Changed**: ~8 files (4 new, 4 modified)  
**Breaking Changes**: Yes (layout completely changes)

---

## Pre-Implementation Checklist

- [x] Next.js 16 app router project
- [x] TypeScript + Tailwind configured
- [x] Framer Motion installed
- [x] Current executor data structure in [src/types/executor.ts](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/types/executor.ts)
- [ ] Executor logos stored in `public/executors/` or similar
- [ ] Git commit: "Pre-UI-overhaul checkpoint"

---

## Phase 1: Declutter & Polish (2-3 hours)

### 1.1 Create Loading Animation Component

**NEW FILE**: `src/components/shared/LoadingIntro.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function LoadingIntro({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    // Check if user has seen intro this session
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    
    if (hasSeenIntro) {
      setShow(false);
      onComplete();
      return;
    }
    
    // Hide after 1.5s
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("hasSeenIntro", "true");
      onComplete();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!show) return null;
  
  const text = "Key-Kingdom";
  const letters = text.split("");
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background-DEFAULT"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl font-bold text-text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                delay: i * 0.05,
                duration: 0.3,
              }}
              className="inline-block"
            >
              {letter === "-" ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 1.2 Add Loading Intro to Page

**MODIFY**: [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx)

Add at top of file:
```typescript
import { useState } from "react";
import { LoadingIntro } from "@/components/shared/LoadingIntro";
```

Wrap the entire page content:
```typescript
export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const { data: executors, isLoading, isError } = useExecutors();

  return (
    <>
      <LoadingIntro onComplete={() => setShowContent(true)} />
      
      {showContent && (
        <div className="min-h-screen bg-background-DEFAULT">
          {/* Rest of existing content */}
        </div>
      )}
    </>
  );
}
```

**DELETE LINES 67-72**: Remove the info box:
```typescript
// DELETE THIS:
<div className="glass-card mb-6 p-4 shadow-glass text-sm text-text-muted">
  <p>
    Compact table layout with collapsible rows. Click any executor to
    expand details.
  </p>
</div>
```

### 1.3 Add Copy Functionality to Platform Pills

**MODIFY**: [src/components/shop/PlatformStatusPills.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/PlatformStatusPills.tsx)

Add imports:
```typescript
import { Copy, Check } from "lucide-react";
import { useState } from "react";
```

Inside the expanded pill section (around line 140), add copy button:

```typescript
// Find this section (version hash display):
<code className="block rounded-lg px-3 py-1.5 font-mono text-sm text-text-primary border border-white/10 backdrop-blur-sm"
  style={{
    background: 'linear-gradient(135deg, rgba(30, 35, 41, 0.65) 0%, rgba(21, 26, 33, 0.65) 100%)',
  }}
>
  {platformStatuses?.[expanded]?.version ?? versions?.[expanded] ?? "Awaiting data"}
</code>

// Replace with:
<div className="relative">
  <code className="block rounded-lg px-3 py-1.5 pr-10 font-mono text-sm text-text-primary border border-white/10 backdrop-blur-sm select-all"
    style={{
      background: 'linear-gradient(135deg, rgba(30, 35, 41, 0.65) 0%, rgba(21, 26, 33, 0.65) 100%)',
    }}
  >
    {platformStatuses?.[expanded]?.version ?? versions?.[expanded] ?? "Awaiting data"}
  </code>
  <CopyButton text={platformStatuses?.[expanded]?.version ?? versions?.[expanded] ?? ""} />
</div>
```

Add CopyButton component at bottom of file:
```typescript
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 transition"
      title="Copy version hash"
    >
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4 text-text-muted" />
      )}
    </button>
  );
}
```

---

## Phase 2: Card Grid Layout (3-4 hours)

### 2.1 Create ExecutorCard Component

**NEW FILE**: `src/components/shop/ExecutorCard.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Executor } from "@/types/executor";
import { SuncBadge } from "@/components/shared/SuncBadge";
import { formatPrice } from "@/lib/utils/formatters";

interface ExecutorCardProps {
  executor: Executor;
}

export function ExecutorCard({ executor }: ExecutorCardProps) {
  const platforms = Object.entries(executor.platforms)
    .filter(([, supported]) => supported)
    .map(([platform]) => platform);

  return (
    <Link href={`/executors/${executor.slug}`}>
      <motion.div
        className="group relative h-full rounded-2xl border border-white/10 bg-background-surface p-6 transition-all hover:border-primary/50 hover:shadow-glass-hover"
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Status Indicator */}
        <div className="absolute right-4 top-4">
          <div
            className={`h-2.5 w-2.5 rounded-full animate-pulse ${
              executor.status.working ? "bg-success" : "bg-danger"
            }`}
          />
        </div>

        {/* Logo/Icon */}
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-background-elevated text-3xl font-bold text-text-primary">
          {executor.name[0]}
        </div>

        {/* Name */}
        <h3 className="mb-2 text-xl font-semibold text-text-primary group-hover:text-primary transition">
          {executor.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
          {executor.description}
        </p>

        {/* sUNC Badge - Prominent */}
        <div className="mb-4 flex justify-center">
          <SuncBadge rating={executor.suncRating} size="lg" showGlow />
        </div>

        {/* Platforms */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="rounded-md bg-background-elevated px-2 py-1 text-xs capitalize text-text-secondary"
            >
              {platform}
            </span>
          ))}
        </div>

        {/* Bottom: Rating + Price */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 text-warning" />
            <span className="text-text-primary">{executor.rating.average.toFixed(1)}</span>
            <span className="text-text-muted">({executor.rating.count})</span>
          </div>

          <span className="font-semibold text-text-primary">
            {executor.pricing.rawCostString ||
              formatPrice(executor.pricing.price, executor.pricing.currency)}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-end justify-center rounded-2xl bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 p-6">
          <span className="text-sm font-semibold text-primary">
            View Details →
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
```

### 2.2 Create ExecutorGrid Component

**NEW FILE**: `src/components/shop/ExecutorGrid.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import type { Executor } from "@/types/executor";
import { ExecutorCard } from "./ExecutorCard";

interface ExecutorGridProps {
  executors: Executor[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ExecutorGrid({ executors }: ExecutorGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {executors.map((executor) => (
        <motion.div key={executor.id} variants={item}>
          <ExecutorCard executor={executor} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 2.3 Update Page to Use Grid

**MODIFY**: [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx)

Replace import:
```typescript
// OLD:
import { ExecutorTable } from "@/components/shop/ExecutorTable";

// NEW:
import { ExecutorGrid } from "@/components/shop/ExecutorGrid";
```

Replace usage (around line 75):
```typescript
// OLD:
return <ExecutorTable executors={executors} />;

// NEW:
return <ExecutorGrid executors={executors} />;
```

### 2.4 Update SuncBadge for Larger Sizes

**MODIFY**: [src/components/shared/SuncBadge.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shared/SuncBadge.tsx)

If the component doesn't support `size="lg"`, add it:

```typescript
interface SuncBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
  showLabel?: boolean;
}

export function SuncBadge({ 
  rating, 
  size = "md", 
  showGlow = false,
  showLabel = true 
}: SuncBadgeProps) {
  const sizeClasses = {
    sm: "text-lg px-2 py-1",
    md: "text-xl px-3 py-1.5",
    lg: "text-3xl px-4 py-2",
  };
  
  // ... rest of component with size variants
}
```

---

## Testing Steps

### After Phase 1:
1. Clear browser cache and reload
2. Verify loading animation shows (letter-by-letter blur)
3. Reload page - animation should NOT show (sessionStorage check)
4. Clear sessionStorage and reload - animation should show again
5. Expand a platform pill
6. Click copy button next to version hash
7. Verify hash is in clipboard
8. Check for green checkmark feedback

### After Phase 2:
1. Verify executor cards display in 3-column grid on desktop
2. Resize to tablet (768px) - should show 2 columns
3. Resize to mobile (375px) - should show 1 column
4. Hover over cards - should see:
   - Subtle lift (y: -4)
   - Border glow (primary color)
   - "View Details →" overlay
5. Click a card - should navigate to `/executors/[slug]` (will 404 for now, that's OK)
6. Verify sUNC badges are large and prominent
7. Check all executor data displays correctly

---

## Fallback Plan: Switching to Collaboration

**If you want to stop and switch to Option C at any point:**

### Checkpoint 1: After Phase 1 Complete
**Tell me**: "Phase 1 done, let's collaborate on Phase 2"

**I will**:
- Review your Phase 1 code
- Suggest improvements if needed
- Walk you through Phase 2 step-by-step
- Debug any issues together

### Checkpoint 2: After Creating ExecutorCard
**Tell me**: "ExecutorCard created, need help with grid"

**I will**:
- Review your ExecutorCard component
- Help with responsive grid layout
- Adjust spacing/sizing together
- Test hover states

### Checkpoint 3: If You Hit Any Blocker
**Tell me**: "Stuck on [specific issue]"

**I will**:
- Debug the specific problem
- Provide targeted code fixes
- Explain the solution
- Continue implementation from that point

### How to Handoff Mid-Implementation

1. **Commit what you have**: `git commit -m "WIP: Phase X incomplete"`
2. **Screenshot any errors** or unexpected behavior
3. **Tell me**: "Ready for Option C, here's where I'm at..."
4. **I'll audit your code** and continue from there

---

## Quick Reference

### File Structure After Implementation:
```
src/
├── components/
│   ├── shared/
│   │   ├── LoadingIntro.tsx        [NEW]
│   │   └── SuncBadge.tsx          [MODIFIED]
│   └── shop/
│       ├── ExecutorCard.tsx        [NEW]
│       ├── ExecutorGrid.tsx        [NEW]
│       ├── PlatformStatusPills.tsx [MODIFIED]
│       ├── ExecutorTable.tsx       [KEEP FOR BACKUP]
│       └── ExecutorRow.tsx         [KEEP FOR BACKUP]
├── app/
│   └── page.tsx                    [MODIFIED]
```

### Key Dependencies:
- framer-motion (already installed)
- lucide-react (already installed)
- All existing type definitions (no changes needed)

### Color Variables (from globals.css):
```css
background-DEFAULT: #0B0E11
background-surface: #151A21
background-elevated: #1E2329
primary: #5865F2
success: #43B581
danger: #F04747
warning: #FAA61A
```

---

## Ready to Start?

**Command for Claude Code**:
```
"Implement Phase 1 & 2 of the implementation plan in implementation_plan.md. 
Start with Phase 1 (loading animation + cleanup), test it, then move to Phase 2 (card grid). 
Follow the exact file structure and code provided."
```

**Or send this entire file** to Claude Code/Codex as context.

Good luck! 🚀
