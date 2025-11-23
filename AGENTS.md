### 2️⃣ `docs/agents.md`

```md
# agents.md – Multi-Agent Guidelines for Key-Kingdom

This document defines how different AI “agents” (Claude Code, planning agents, review agents, etc.) should behave when working on the **Key-Kingdom** codebase and docs.

The goal is to keep:

- 🧠 **Product framing** consistent (executor marketplace / shop hub)  
- 📐 **UX and brand rules** respected (no pill-filters, sUNC-first)  
- 📄 **Docs usage** predictable (agents know which files to read first)  

---

## 1. Shared Invariants (All Agents)

These rules apply to every agent, regardless of role:

1. **Product Identity**
   - Key-Kingdom is an **executor marketplace / shop hub**.
   - Never describe it primarily as “just a status tracker” or “status site”.
   - Status data (via WEAO) supports the marketplace; it is not the product itself.

2. **Platform Pills**
   - Global platform pills are **status capsules only**.
   - They show **Roblox version hash**, **last updated time**, and **status (Stable/Partial/Broken)**.
   - They **do not filter** executors and never hide rows in the shop table.

3. **sUNC-First Ordering**
   - Executor lists are **always sorted by sUNC rating (descending)**.
   - Use a shared `sortExecutorsBySUNC` helper when sorting.
   - Do not add alternate default sorts (e.g. name or price) without clearly annotating the change in specs.

4. **Design System**
   - Use the **brand spec** from `docs/KEYKINGDOM_BRAND_SPEC.md`.
   - Use the **component patterns** from `docs/keykingdomshopcomponents.md`.
   - Do not invent new palettes or radically different UI styles without updating the brand spec.

5. **Docs Canon**
   - When in doubt, consult:
     1. `docs/APP_SPEC.md` – What the product does.
     2. `docs/KEYKINGDOM_BRAND_SPEC.md` – How it should look and feel.
     3. `docs/PROJECT_INIT.md` – How the project is wired technically.
     4. `docs/STATUS_SYSTEM.md` + `docs/API_NOTES.md` – How status and WEAO work.

---

## 2. Agent Roles

You can adjust names/roles to match your actual setup, but the **intent** stays the same.

### 2.1 Architect Agent

**Purpose:** High-level decisions and changes to architecture, data models, and product flows.

**Responsibilities:**

- Keep **core invariants** intact:
  - Marketplace first
  - Pills = status only
  - sUNC-first ordering
- Update or extend:
  - Page-level flows (new routes, new pages)
  - Data models (`Executor`, `Review`, `User`)
  - Integration patterns for WEAO and internal APIs

**Required docs before changes:**

- `docs/APP_SPEC.md`
- `docs/KEYKINGDOM_BRAND_SPEC.md`
- `docs/STATUS_SYSTEM.md`
- `docs/API_NOTES.md`

**Forbidden actions:**

- Re-framing Key-Kingdom as “just a status tracker”
- Turning platform pills into filters
- Removing sUNC as primary executor sort key

---

### 2.2 Implementer / Claude Code Agent

**Purpose:** Write or modify actual code (Next.js, React, TypeScript, Tailwind, etc.).

**Responsibilities:**

- Implement features described in `APP_SPEC.md` and `PROJECT_INIT.md`.
- Use components as defined in `keykingdomshopcomponents.md`.
- Follow the brand spec for colors, typography, and layout.

**Checklist before coding:**

1. Read or re-skim:
   - `docs/PROJECT_INIT.md`
   - `docs/keykingdomshopcomponents.md`
   - `docs/ANIMATION_IMPLEMENTATIONGUIDE.md` (if animations are involved)
2. Confirm:
   - Platform pills are rendered from **status data**, not filters.
   - Executor lists use **sUNC-based sorting** from a shared helper.

**When asked to “build X” for Key-Kingdom:**

Include in your prompt (or internal reasoning):

> “This feature is for Key-Kingdom, an executor shop hub. Use the existing table-based layout, sUNC-first ordering, and status-only platform pills as documented in `APP_SPEC.md` and `KEYKINGDOM_BRAND_SPEC.md`.”

---

### 2.3 Docs / Explainer Agent

**Purpose:** Create or update documentation, guides, or comments.

**Responsibilities:**

- Keep terminology aligned:
  - “Executor marketplace”, “shop hub”, “purchase and review platform”.
  - Avoid calling it a generic “status site”.
- Update the appropriate doc file:
  - Product flows → `APP_SPEC.md`
  - Brand rules → `KEYKINGDOM_BRAND_SPEC.md`
  - Code wiring → `PROJECT_INIT.md`
  - Status/WEAO → `STATUS_SYSTEM.md` and `API_NOTES.md`
  - Component props/patterns → `keykingdomshopcomponents.md`

**Formatting rules:**

- Use `# DOCNAME` header.
- Keep existing sections and add new ones rather than silently deleting content.
- If behavior changes, annotate with a short note (e.g., “**Note (2025-11-22):** Platform pills now use X behavior.”).

---

### 2.4 Reviewer / QA Agent

**Purpose:** Review proposed changes (code or docs) for consistency with spec.

**Checklist:**

1. **Product framing:**
   - Does the change keep Key-Kingdom as an executor marketplace?
   - Does any copy mistakenly call it primarily a “status tracker”?

2. **Platform pills:**
   - Are pills used only for displaying platform status and versions?
   - Is there any logic that filters executors by pill state? (If yes → flag.)

3. **sUNC ordering:**
   - Does the executor list still use `sortExecutorsBySUNC` (or equivalent)?
   - Are there any new default sorts that override sUNC? (If yes → flag.)

4. **Brand & UX:**
   - Are colors, fonts, and layout consistent with `KEYKINGDOM_BRAND_SPEC.md`?
   - Do new components align with patterns in `keykingdomshopcomponents.md`?

5. **Status system:**
   - Are status calculations consistent with `STATUS_SYSTEM.md`?
   - Are any polling or incident rules changed without doc updates? (If yes → request update.)

---

## 3. Recommended Agent Prompt Templates

### 3.1 Implementer (Claude Code / coding agent)

> You are a coding assistant working on Key-Kingdom.org, an **executor marketplace / shop hub** for Roblox executors.  
> This is not just a status tracker; status/WEAO data supports the shop experience.
>
> Before you respond, conceptually reference these docs:
> - `docs/APP_SPEC.md` – product spec
> - `docs/KEYKINGDOM_BRAND_SPEC.md` – brand & visual rules
> - `docs/PROJECT_INIT.md` – project structure & wiring
> - `docs/keykingdomshopcomponents.md` – component contracts
> - `docs/STATUS_SYSTEM.md` + `docs/API_NOTES.md` – status/WEAO behavior
>
> Critical invariants:
> - Platform pills are **status capsules only** – they show Roblox version hash, last updated, and platform status, but do **not** filter executors.
> - Executor listings are **always sorted by sUNC rating (descending)** using a shared helper.
> - Use the color and typography system from `KEYKINGDOM_BRAND_SPEC.md` and the table-based layout from `APP_SPEC.md`.

Then describe the specific feature or file.

---

### 3.2 Docs / Explainer Agent

> You are updating documentation for Key-Kingdom.org, an **executor marketplace / shop hub**.  
> Maintain the framing that Key-Kingdom is a **shop hub first, status tracker second**.  
> Keep platform pills as **status-only capsules** and preserve **sUNC-first ordering** of executors.
>
> When you change behavior, update the appropriate doc:
> - Product flows → `APP_SPEC.md`
> - Brand rules → `KEYKINGDOM_BRAND_SPEC.md`
> - Implementation details → `PROJECT_INIT.md`
> - Status/WEAO logic → `STATUS_SYSTEM.md`, `API_NOTES.md`
> - Component patterns → `keykingdomshopcomponents.md`

---

### 3.3 QA / Review Agent

> You are reviewing a change for Key-Kingdom.org.  
> Your main job is to enforce invariants:
> - Key-Kingdom is always described as an **executor marketplace / shop hub**, not just a status tracker.
> - Platform pills are **status display only**, never filters.
> - Executor lists are **always sorted by sUNC rating (descending)**.
> - Visual and UX decisions follow `KEYKINGDOM_BRAND_SPEC.md`.
> - Components and layouts follow `keykingdomshopcomponents.md`.
>
> Point out any violations of these rules and suggest concrete fixes.

---

## 4. File Responsibilities Summary

When an agent needs to know **“where do I put this?”**, use this map:

- **Brand & visual rules** → `docs/KEYKINGDOM_BRAND_SPEC.md`
- **Overall product spec** → `docs/APP_SPEC.md`
- **Implementation / wiring** → `docs/PROJECT_INIT.md`
- **Status engine & incidents** → `docs/STATUS_SYSTEM.md`
- **WEAO API integration** → `docs/API_NOTES.md`
- **Platform pills behavior** → `docs/PLATFORMPILLSQUICKREF.md`
- **Animations & motion** → `docs/ANIMATION_IMPLEMENTATIONGUIDE.md`
- **Shop components (table, cards, filters)** → `docs/keykingdomshopcomponents.md`
- **AI assistant instructions & phrasing** → `docs/CLAUDE.md`
- **This multi-agent protocol** → `docs/agents.md`

---

## 5. Change Management

When any agent makes a **breaking change** to behavior, it should:

1. Update the relevant `docs/*.md` file(s).
2. Preserve existing sections where possible; append rather than delete.
3. Add a short note like:

> **Note (2025-11-22):** Updated platform pill behavior to show X and Y.

4. Ensure `README.md` still accurately describes the shape of the docs and core invariants.

---

# AGENTS.md

## Setup
- Run: npm install

## Verification
- Run: npm run lint
- Run: npm run build
- Run: npm test

By following this file, all agents—human or AI—stay aligned on what Key-Kingdom is, how it behaves, and how to extend it without accidentally turning it back into “just a status tracker.”