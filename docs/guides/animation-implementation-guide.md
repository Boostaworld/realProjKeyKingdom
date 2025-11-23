# Key-Kingdom Animation Implementation Guide

Key-Kingdom.org is an **executor marketplace / shop hub**. Animations should always support:

- **Clarity in the shopping flow** (browse → inspect → buy → review)
- **Status understanding** (what’s working, what’s broken)
- A modern, **Discord-like dark commerce UI**

They should **never** turn the UI into a noisy “status dashboard”.

---

## 🟢 Status Dot Animation (Executor Working State)

The status dot appears next to executors to show if they’re working, broken, or updating.  
It supports the **shop table / cards**, not a separate status page.

### Tailwind Config: Keyframes & Animations

```ts
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'status-ring': 'status-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
            filter: 'brightness(1) blur(0px)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
            filter: 'brightness(1.2) blur(1px)',
          },
        },
        'status-ring': {
          '0%': {
            transform: 'scale(0.8)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
    },
  },
};
StatusDot Component
tsx
Copy code
// components/ui/StatusDot.tsx
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'working' | 'broken' | 'updating';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export function StatusDot({ status, size = 'md', pulse = true }: StatusDotProps) {
  const sizes = {
    sm: { dot: 'w-2 h-2', ring: 'w-2 h-2' },
    md: { dot: 'w-3 h-3', ring: 'w-3 h-3' },
    lg: { dot: 'w-4 h-4', ring: 'w-4 h-4' },
  };

  const colors = {
    working: {
      dot: 'bg-green-500',
      glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]',
      ring: 'bg-green-500',
    },
    broken: {
      dot: 'bg-red-500',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]',
      ring: 'bg-red-500',
    },
    updating: {
      dot: 'bg-yellow-500',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      ring: 'bg-yellow-500',
    },
  };

  const currentColor = colors[status];
  const currentSize = sizes[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Main dot with glow */}
      <div
        className={cn(
          'rounded-full z-10',
          currentSize.dot,
          currentColor.dot,
          currentColor.glow,
          pulse && 'animate-pulse-glow'
        )}
      />

      {/* Expanding ring effect */}
      {pulse && (
        <div
          className={cn(
            'absolute rounded-full',
            currentSize.ring,
            currentColor.ring,
            'animate-status-ring'
          )}
        />
      )}
    </div>
  );
}
Usage:

Show next to executor name or status line in table rows and cards.

For subtlety, you can disable pulse (pulse={false}) in dense views and keep it enabled in detail views.

🎯 Platform Pill Expansion Animation (Status Capsules)
Platform pills are status capsules, not filters.
They show Roblox version + platform health and live above the main sUNC-sorted shop table.

Framer Motion Implementation
tsx
Copy code
// components/status/PlatformPill.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/utils/formatters';

type PlatformKey = 'Windows' | 'Mac' | 'Android' | 'iOS';

interface PlatformStatus {
  platform: PlatformKey;
  status: 'stable' | 'partial' | 'broken';
  version: string;
  lastChecked: Date;
  message?: string;
}

interface PlatformPillProps {
  data: PlatformStatus;
  isExpanded: boolean;
  onToggle: () => void;
}

const platformIcons: Record<PlatformKey, string> = {
  Windows: '🖥️',
  Mac: '🍎',
  Android: '🤖',
  iOS: '📱',
};

export function PlatformPill({ data, isExpanded, onToggle }: PlatformPillProps) {
  const { platform, status, version, lastChecked, message } = data;

  const pillVariants = {
    collapsed: {
      borderRadius: '9999px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    expanded: {
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  };

  const contentVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: { duration: 0.3, ease: 'easeOut' },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
  };

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative px-4 py-3 min-w-[160px] text-left',
        'glass-pill glass-pill-hover',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary/50'
      )}
      variants={pillVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Main pill content (always visible) */}
      <motion.div layout className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{platformIcons[platform]}</span>
          <span className="font-medium">{platform}</span>
        </div>
        <StatusBadge status={status} />
      </motion.div>

      {/* Expandable content (Roblox build info) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="mt-3 pt-3 border-t border-white/10 space-y-2 text-sm"
            >
              <InfoRow label="Version" value={version} />
              <InfoRow label="Last checked" value={formatTimeAgo(lastChecked)} />
              {message && <InfoRow label="Status" value={message} status={status} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function InfoRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: 'stable' | 'partial' | 'broken';
}) {
  return (
    <motion.div
      className="flex justify-between items-center text-sm"
      initial={{ x: -5, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-white/60">{label}:</span>
      <span
        className={cn(
          'font-mono text-xs',
          status === 'stable' && 'text-green-400',
          status === 'partial' && 'text-yellow-400',
          status === 'broken' && 'text-red-400'
        )}
      >
        {value}
      </span>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: 'stable' | 'partial' | 'broken' }) {
  const label =
    status === 'stable' ? 'STABLE' : status === 'partial' ? 'PARTIAL' : 'BROKEN';

  return (
    <span
      className={cn(
        'text-xs font-semibold px-2 py-0.5 rounded-full',
        status === 'stable' && 'bg-green-500/15 text-green-400',
        status === 'partial' && 'bg-yellow-500/15 text-yellow-400',
        status === 'broken' && 'bg-red-500/15 text-red-400'
      )}
    >
      {label}
    </span>
  );
}
⚠ Reminder: Platform pills do not filter the executor list. They only show platform status and Roblox version data. The main executor table remains fully visible and sUNC-sorted regardless of which pill is expanded.

🎨 Glassmorphism & Visual Effects
Glassmorphism gives pills and cards a modern, “shop panel” feel without overwhelming the user.

Utility Classes
css
Copy code
/* globals.css */
@layer utilities {
  .glass-pill {
    @apply bg-white/5 backdrop-blur-md;
    @apply border border-white/10;
    @apply shadow-[0_8px_32px_0_rgba(31,38,135,0.37)];
  }

  .glass-pill-hover {
    @apply hover:bg-white/8 hover:border-white/20;
    @apply hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)];
  }

  .status-glow-green {
    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
  }

  .status-glow-red {
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6));
  }

  .status-glow-yellow {
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
  }
}
Use glass-pill / glass-pill-hover on:

Platform pills (status capsules)

High-level filter panels

Optional: key marketplace cards (e.g., featured executors, promos)

🧱 Platform Selector Container
This component arranges pills and enforces single expansion.
It sits above the main executor table and does not filter the list.

tsx
Copy code
// components/status/PlatformSelector.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { PlatformStatus } from './PlatformPill';
import { PlatformPill } from './PlatformPill';

interface PlatformSelectorProps {
  platforms: PlatformStatus[];
}

export function PlatformSelector({ platforms }: PlatformSelectorProps) {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const handleToggle = (platform: string) => {
    setExpandedPlatform((prev) => (prev === platform ? null : platform));
  };

  return (
    <motion.div
      className="flex flex-wrap gap-3 justify-center p-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
      }}
    >
      <AnimatePresence mode="popLayout">
        {platforms.map((p, index) => (
          <motion.div
            key={p.platform}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              delay: index * 0.05,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <PlatformPill
              data={p}
              isExpanded={expandedPlatform === p.platform}
              onToggle={() => handleToggle(p.platform)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
This component should be used on the home marketplace page, directly above the executor table.

🎮 Interactive States (Hover / Tap)
Keep interactions crisp and commerce-friendly (think modern shop, not game UI).

Hover Effects (Desktop)
ts
Copy code
// Suggestion patterns
const hoverEffects = {
  pill: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
  card: {
    y: -4,
    boxShadow: '0 10px 40px -15px rgba(124, 58, 237, 0.3)',
    transition: { duration: 0.2 },
  },
};
Apply to:

Executor cards (mobile)

High-level callouts

Buttons (whileHover={{ scale: 1.02 }} minimal)

Click / Tap Feedback
ts
Copy code
const tapEffects = {
  scale: 0.95,
  transition: { type: 'spring', stiffness: 400, damping: 10 },
};
Use on buttons and clickable rows to give a subtle “pressed” feeling.

📱 Mobile & Reduced Motion
Mobile users and users with reduced motion preferences should get a comfortable experience.

Touch-Optimized Animations (Optional Utility)
You may conditionally reduce hover-heavy behavior on touch devices:

ts
Copy code
// inside a client component
const isTouchDevice =
  typeof window !== 'undefined' && 'ontouchstart' in window;

const mobileAnimations = {
  hover: isTouchDevice ? {} : hoverEffects,
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};
Reduced Motion Support
Respect prefers-reduced-motion:

ts
Copy code
// Example pattern with Framer Motion
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

// Later in JSX:
<motion.div
  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
  transition={shouldReduceMotion ? {} : { duration: 0.3 }}
>
  {/* content */}
</motion.div>
When reduced motion is enabled:

Avoid pulsing/glowing effects

Disable large layout shifts

Keep things mostly static with minimal fades

🔧 Performance Optimization
Animations should never make the marketplace feel sluggish.

GPU Acceleration
css
Copy code
/* Force GPU acceleration for smooth animations */
.animate-pulse-glow {
  will-change: transform, opacity, filter;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  perspective: 1000px;
}
Apply will-change only to elements that truly animate frequently (status dots, key buttons), not to everything.

Debounced Interactions (Optional)
Avoid rapid state thrashing on quick taps:

ts
Copy code
import { useCallback } from 'react';
import { debounce } from 'lodash';

const useDebouncedPlatformToggle = (setExpandedPlatform: (v: string | null) => void) =>
  useCallback(
    debounce((platform: string) => {
      setExpandedPlatform((prev) => (prev === platform ? null : platform));
    }, 100),
    []
  );
This is optional—only reach for debouncing if you see actual performance issues in profiling.

🧪 Animation Testing Checklist
Status Dot
 Working executors show a green dot with soft pulse

 Broken executors show a red dot, no misleading “healthy” pulse

 Updating/partial states show yellow dot

 No flicker when status data changes (thanks to sensible React Query configuration)

Platform Pills
 Clicking a pill expands it with:

 Roblox version string

 Last-checked time

 Optional status message

 Clicking another pill collapses the previous one

 No executor rows disappear/appear when toggling pills

 Animations feel smooth and snappy (no stutter)

Marketplace Flow
 Animations do not delay or obscure:

Seeing sUNC rankings

Recognizing “Buy Now” buttons

Reading key status/safety info

 Reduced motion mode is respected:

Pulses and large motions are minimized or removed

🔗 Related Docs
For full context and consistency:

docs/app_spec.md
Overall product spec, sUNC-first marketplace behavior

docs/claude.md
High-level instructions for AI assistants

docs/claudecodeimplementchecklist.md
Stepwise implementation checklist

docs/platformpillsquickref.md
Platform pill behavior (status capsules, not filters)

docs/status_system.md
Status calculation, platform health, incident detection

docs/api_notes.md
WEAO API integration details (versions & status endpoints)

TL;DR:
Animations in Key-Kingdom should make the executor shop feel modern and trustworthy:

Status dots: clear, subtle, meaningful

Platform pills: status capsules showing Roblox builds (no filtering)

Marketplace: always readable, sUNC-first, with fast and light transitions