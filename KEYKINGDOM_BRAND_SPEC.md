# KEYKINGDOM_BRAND_SPEC.md

## 1. Brand Identity

**Brand Name:** Key-Kingdom  
**Domain:** key-kingdom.org  
**Primary Product:** Executor marketplace / shop hub for Roblox executors

### 1.1 What Key-Kingdom Is

Key-Kingdom is:

- ✅ A **commerce-focused marketplace** for Roblox executors  
- ✅ A **shop hub** where users browse, compare, and purchase executors  
- ✅ A **safety-first catalog**, where sUNC and clear status information help users make informed choices  
- ✅ A **central “home base”** users can trust to discover and evaluate executors  

### 1.2 What Key-Kingdom Is Not

Key-Kingdom is **not**:

- ❌ A generic “status tracker”
- ❌ A generic “uptime monitor”
- ❌ A simple list of executors without pricing or purchase flows
- ❌ A random collection of status widgets without a clear marketplace narrative

**Always phrase it as:**

- “Executor marketplace”
- “Executor shop hub”
- “E-commerce platform for Roblox executors”
- “Purchase and review platform for executors”

Never describe it primarily as a “status page,” “status monitoring platform,” or “executor tracker.”

---

## 2. Brand Personality

### 2.1 Tone & Voice

**Tone:** Clear, confident, modern, slightly technical but approachable.

- ✅ **Clarity first** – explain features and risks plainly
- ✅ **Safety-forward** – highlight sUNC and risk levels without drama
- ✅ **Helpful and concise** – minimal fluff, no hypey/overly gamer-y speak
- ✅ **Trust-building** – emphasize verification, transparency, and community reviews

Avoid:

- ❌ Overly juvenile memes or spammy marketing language  
- ❌ Overpromising (“100% undetectable forever”)  
- ❌ Technobabble that hides what’s actually happening  

**Example phrasing:**

> “Key-Kingdom is an executor marketplace that helps you compare executors by safety, features, and price—backed by real-time status data and community reviews.”

### 2.2 Brand Values

- **Safety:** sUNC-first, warnings visible, suspicious executors clearly labeled.
- **Transparency:** Show status, last update, reviews, and pricing clearly.
- **Control:** Users feel they can make informed decisions, not be tricked.
- **Performance:** UI feels fast, responsive, and solid.

---

## 3. Visual System

### 3.1 High-Level Aesthetic

- **Mode:** Dark-mode only
- **Vibe:** Neon-tech / cyber-console, inspired by Discord and modern dashboards
- **Density:** Information-dense on desktop, but never cluttered
- **Motion:** Subtle, purposeful, performant animations

Think:

> “Discord + trading dashboard + clean e-commerce layout.”

### 3.2 Color Palette

Use this as the **canonical palette** for Key-Kingdom UI:

```ts
background: {
  DEFAULT: "#0B0E11",   // Main page background (blue-black)
  surface: "#151A21",   // Cards, table rows
  elevated: "#1E2329",  // Hover states, popovers
},

primary: "#5865F2",     // Blurple CTAs (Discord-inspired)
success: "#43B581",     // Working / safe
danger:  "#F04747",     // Broken / critical
warning: "#FAA61A",     // Suspicious / caution

text: {
  primary:   "#FFFFFF",
  secondary: "#B9BBBE",
  muted:     "#72767D",
}
Cyan / neon accents are allowed as subtle glows or gradients, but:

They must not replace the canonical primary color for CTAs.

Use them for glows, borders, or background gradients only.

Example accent usage:

Button glow on hover

Card outline glow behind a status widget

Background gradient behind the hero section

3.3 Typography
Primary font: Inter
Monospace font: JetBrains Mono

Usage:

Headings: Inter, weights 600–700

Body: Inter, weight 400–500

Code / tags / version hashes: JetBrains Mono

Rules:

Sentence case for headings (not ALL CAPS, unless explicitly needed).

Avoid more than two sizes of body text on a single view.

Use JetBrains Mono for:

Roblox version hashes

sUNC numeric displays (optional)

Timestamps / technical labels

4. Logo & Symbol
4.1 Logo Concept
Key-Kingdom uses an abstract, node-cluster / key-node symbol:

A cluster of connected nodes (dots and lines)

Suggests “keys,” “links,” and “a map of executors”

Works in 16×16 (favicon) up to large hero graphics

Strict rule:

❌ No animals (no lynx, no mascots)

❌ No literal keys

❌ No letters / wordmarks inside the symbol (no big “K”)

The wordmark “Key-Kingdom” can appear separately next to or below the symbol, using Inter with slight letter spacing.

4.2 Usage
Favicon: simplified node cluster without text

Header: symbol + “Key-Kingdom” wordmark

Social: symbol inside a rounded square, dark background

Color:

Use primary or subtle gradient built around primary + a cyan accent.

Avoid harsh multi-color logos; keep it focused and modern.

5. Layout & Components
5.1 Global Layout
Desktop: max-width ~1200–1440px centered layout.

Background: full-bleed dark gradient or solid background.DEFAULT.

Main content:

Top: Platform status strip (platform pills)

Middle: Filter/search bar

Below: Executor table

5.2 Buttons
Primary Button:

Background: primary

Text: text.primary (white)

Radius: rounded-2xl (or 0.75rem+)

Examples: “Buy Now”, “View Details”

Secondary Button:

Background: background.elevated

Border: 1px solid primary or white/10

Text: text.primary or text.secondary

Ghost Button:

Transparent background

On hover: background.surface

All buttons must:

Have clear hover and active states

Be keyboard-focusable with visible focus rings

Avoid overusing shadows; keep them subtle

5.3 Cards & Surfaces
Use cards for:

Executor detail sections

Review boxes

Status / incident summaries

Card styling:

Background: background.surface

Border: 1px solid white/10 or primary/20

Radius: at least rounded-xl

Soft shadow, optionally with glow for key elements

5.4 Executor Table
The home view is a table, not a grid of cards, on desktop.

Columns:

Executor (logo + name + short description)

sUNC rating (big number, label)

Status (working / not working, Roblox version)

Platform tags

Category badge (Reputable / Suspicious)

Rating (stars + review count)

Price

Actions (View Details / Buy Now)

Behavior:

Rows are clickable, hover-elevated.

“Buy Now” and “View Details” are clearly visible.

On mobile, table turns into stacked cards.

Always ensure:

Table data is ordered by sUNC descending.

Visual emphasis on sUNC, not just fancy logos.

6. Status System & Pills (Brand Rules)
6.1 Status as Supporting Feature
The brand narrative:

“Key-Kingdom is a safe place to buy executors. Status and versions help you understand which ones actually work right now.”

So:

Status is supportive, not the hero.

The hero is the marketplace listing sorted by sUNC.

6.2 Platform Status Pills
The global platform strip:

One pill per platform (Windows, Mac, Android, iOS)

Pills show:

Platform icon & name

Current status: Stable / Partial / Broken

When expanded:

Roblox version string (hash or semver)

Last checked time

Optional derived message (“Most Windows executors stable”)

Brand-critical behavior:

Pills are information only:

🚫 They do not filter executors.

🚫 They do not hide executors from the table.

Expansion uses smooth, contained motion (Framer Motion), respecting reduced-motion settings.

Visual style:

Glassmorphism: semi-transparent backgrounds, subtle blur.

Clear state color:

Stable → success

Partial → warning

Broken → danger

7. Copy & Microcopy
7.1 Key Phrases
Use:

“Executor marketplace”

“Shop hub”

“Buy executors safely”

“sUNC safety rating”

“Reputable executors”

“Suspicious executors”

Avoid:

“Status-only site”

“Just a tracker”

“Random list of executors”

7.2 CTAs
Examples:

“View Details”

“Buy Now”

“Visit Website”

“Join Discord”

“Read Reviews”

Avoid ambiguous CTAs like “Go”, “Click here”, etc.

8. Accessibility & Inclusivity
Dark background with WCAG AA contrast for all text.

Clear focus states for all interactive elements.

Non-color cues for status (icons, labels) in addition to color.

Respect prefers-reduced-motion and provide reduced animations.

9. Usage by AI Assistants
When AI tools (Claude, ChatGPT, others) generate UI or text for Key-Kingdom, they must:

Treat Key-Kingdom as an executor marketplace.

Keep platform pills as status capsules only.

Preserve sUNC-first ordering of executors.

Use the brand palette and typography as defined in this file.

Avoid introducing mascots, cartoon logos, or conflicting color systems.