# Key-Kingdom Quick Reference: Platform Pills (Status Capsules)

> **Core concept:**  
> Platform pills are **status/info capsules only**.  
> They **DO NOT filter** executors. They show **Roblox builds + platform health**.

---

## 🎯 Mental Model

### Old (Deprecated)
- Pills acted like **filters** that controlled which executors were shown.

### New (Correct)
- Pills are **status capsules**:
  - Show **current Roblox version** for each platform
  - Show **last checked time**
  - Show **platform health** (Stable / Partial / Broken)
- Executor visibility and sorting **do not depend** on pill state.

> If you catch yourself using pills to “filter” anything, stop and move that logic into a separate filter system (if needed).

---

## 🔄 Behavioral Definition

### Platform Pills (Status Capsules)

At a high level:

```ts
// Conceptual platform pill data
type PlatformKey = "Windows" | "Mac" | "Android" | "iOS";

interface PlatformBuildStatus {
  platform: PlatformKey;
  status: "stable" | "partial" | "broken";
  version: string;        // hash for desktop, semver for mobile
  lastChecked: Date;
  message?: string;       // e.g., "Most Windows executors are working"
}
Each pill shows:

Platform icon + name

Current platform status (Stable, Partial, Broken)

On expand:

Roblox version string

“Last checked X minutes ago”

Short status message (derived from status system)

Behavior rules:

Only one pill expanded at a time

Smooth expand/collapse animation via Framer Motion

Pills do NOT:

Filter executors

Change sorting

Hide or reveal any rows/cards

🧮 Data Source & Mapping
WEAO Versions → Pills
Use the WEAO versions endpoints (proxied through Next.js API routes):

GET /versions/current

Optionally:

GET /versions/future

GET /versions/past

These return values like:

Windows / Mac: version-31fc142272764f02

Android / iOS: semantic version 2.690.721

*Date fields: timestamps (UTC) for last update

You then combine:

Versions data (/versions/current)

Executor status data (/status/exploits)

…to compute a PlatformBuildStatus for each pill.

For status calculation and incident logic, follow docs/status_system.md.

📝 Implementation Checklist
Remove / Avoid
 ✅ All filtering logic from platform pills

 ✅ Any platformFilter state wired directly to pill clicks

 ✅ Any code that hides executors based on pill selection

If something like this exists:

ts
Copy code
// ❌ DO NOT DO THIS
const filtered = executors.filter(e => e.platforms[activePlatform]);
…and activePlatform comes from the pills, that’s wrong.
Filters should be handled by separate UI controls, not these pills.

Add / Ensure
 PlatformPill component:

 Accepts a single platform’s status (Stable/Partial/Broken)

 Shows icon + name + status chip

 On expand: Roblox version + last checked + short message

 PlatformSelector / PlatformStatusPills container:

 Manages which pill is expanded

 Enforces one-pill-expanded-at-a-time logic

 Smooth expand/collapse:

 Height animation (height: 0 → auto)

 Opacity + slight translate for inner rows

 Visual styling consistent with:

 Dark theme

 Glassmorphism (backdrop blur)

 Subtle glow on hover

🎨 Visual Guide
Platform Pill States
Collapsed

text
Copy code
┌─────────────────────────┐
│ 🖥️ Windows • STABLE    │
└─────────────────────────┘
Expanded

text
Copy code
┌─────────────────────────┐
│ 🖥️ Windows • STABLE    │
├─────────────────────────┤
│ Version: version-31fc14 │
│ Last checked: 2 min ago │
│ Status: Most executors   │
│         working fine     │
└─────────────────────────┘
The top line never changes between collapsed/expanded.

The lower block fades + slides in on expand, and out on collapse.

🧱 Component Responsibilities
PlatformPill.tsx
Renders the pill for a single platform.

Responsible for:

Visual layout

Framer Motion animation (collapsed/expanded variants)

Accessibility (button semantics, focus ring)

Not responsible for:

Which pill is currently expanded (parent controls that)

Fetching WEAO data itself (data should be passed in)

Expected props (example):

ts
Copy code
interface PlatformPillProps {
  platform: PlatformKey;         // "Windows" | "Mac" | "Android" | "iOS"
  status: "stable" | "partial" | "broken";
  version: string;
  lastChecked: Date;
  message?: string;
  isExpanded: boolean;
  onToggle: () => void;          // parent manages which one is open
}
PlatformSelector.tsx (or PlatformStatusPills.tsx)
Manages an array of PlatformBuildStatus

Holds local state:

ts
Copy code
const [expanded, setExpanded] = useState<PlatformKey | null>(null);
onToggle logic ensures:

ts
Copy code
setExpanded((prev) => (prev === platform ? null : platform));
Renders all pills with consistent layout, usually above the executor table.

🏪 Relationship to Executor Table
Pills vs. Table
Pills show platform-level health & Roblox version.

The executor table shows per-executor status + sUNC.

Executor cards/rows must:

Always show supported platform tags (icons or pills) on the row/card.

Always appear even if a platform pill is collapsed or not chosen.

Be sorted by sUNC descending independently of pill state.

If you want filters (like “show only reputable”), implement them in a separate filter bar (see docs/keykingdomshopcomponents.md), not within these pills.

🧪 Testing Focus
1. Pill Interaction
 Click Windows pill → expands, shows version + timestamps

 Click Mac pill → Mac expands, Windows collapses

 Click Mac pill again → collapses (no pills expanded)

 Animations are smooth, no layout glitches

2. Non-Filtering Guarantee
 Number of executors shown does not change when pills are toggled

 Sorting order (sUNC descending) stays the same regardless of pill state

 No “hidden” rows appear/disappear when interacting with pills

A quick test:

Count executors shown.

Expand Windows pill.

Count executors again.
→ The count should be exactly the same.

3. Data Accuracy
 Version strings match values derived from WEAO versions endpoint

 “Last checked” roughly matches polling/refetch intervals

 Platform statuses (Stable/Partial/Broken) match logic from docs/status_system.md

📊 Data Flow Summary
text
Copy code
WEAO API
  ├─ /versions/current   → Roblox build info per platform
  └─ /status/exploits    → Executor statuses per platform

↓ (via Next.js API routes with caching & User-Agent header)

React Query hooks
  ├─ useRobloxVersions()      → versions + timestamps
  └─ useExecutorStatus()      → executor working/broken data

↓ (via helper functions)

Status helpers
  └─ calculatePlatformHealth()   → stable/partial/broken for each platform

↓ (UI)

PlatformSelector
  └─ PlatformPill[platform]     → status capsule for each platform
🧭 Quick Mental Checklist
When working with platform pills, ask:

“Am I filtering executors with these pills?”

If yes → ❌ wrong. Move that logic somewhere else.

“Do I show Roblox version + last checked on expand?”

If no → add it using WEAO versions data.

“Is only one pill expanded at a time?”

If no → fix expandedPlatform logic in the parent.

“Does the main list still feel like a shop table sorted by sUNC?”

It should, regardless of what the pills are doing.

🔗 Related Docs
For deeper implementation details, see:

docs/status_system.md — status calculation, platform health, incidents

docs/api_notes.md — WEAO API integration patterns & endpoints

docs/keykingdomshopcomponents.md — how pills coexist with table & filters

docs/animationimplementationguide.md — detailed animation patterns