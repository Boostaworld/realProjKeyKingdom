# Phase 3 & 4 Refined Design Plan

**Goal**: Create a seamless, "wow" experience with compact cards, immersive modals, and native RDD integration.

---

## Phase 3: Premium UI Polish

### 3.1 Compact Executor Cards (Key-Empire Style)
**Problem**: Current cards are too bulky.
**Solution**: sleek, compact cards that focus on the visual identity.

**Design Spec**:
- **Dimensions**: Aspect ratio ~3:4 (Portrait), smaller footprint.
- **Layout**:
  - **Background**: Subtle glassmorphism gradient.
  - **Image**: Large, high-quality logo/icon centered in upper half.
  - **Title**: Bold, centered below image.
  - **Status Dot**: Small pulsing dot in top-right corner (Green/Red).
  - **Price**: Minimal badge in bottom-right (e.g., "Free" or "$20").
  - **Hover**: Subtle lift (y: -4px) + border glow. **No overlay text** (keep it clean).

### 3.2 Immersive Detail Modal
**Problem**: Full pages break flow; previous modal design had too much empty space.
**Solution**: A dense, information-rich modal that feels like a "command center".

**Layout Specification**:
```
┌──────────────────────────────────────────────────────────────┐
│  [sUNC Badge (98%)]                                     [X]  │ ← Top-left Badge
│                                                              │
│                        [Executor Logo]                       │ ← Centered Large Logo (80px)
│                            (Glow)                            │
│                                                              │
│                     [Solara] (Title)                         │
│                                                              │
│  [Status: Working 🟢]          [Updated: 2d ago]             │ ← Compact Status Row
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  "Solara is a trusted free executor..."                │  │ ← Short Description
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Key Features]                                              │
│  • Level 8 Executor    • 98% UNC                             │ ← 2-Column Feature Grid
│  • No Key System       • 24/7 Support                        │
│                                                              │
│  [Windows (Glass)]   [Mobile (Glass)]                        │ ← Glass Badges
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐      │
│  │    [Download]        │      │   [Visit Website]    │      │ ← Conditional Buttons
│  └──────────────────────┘      └──────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

**Refinements**:
- **Conditional Buttons**:
  - If `purchaseUrl` exists → Show "Buy Now" / "Visit Website".
  - If `downloadUrl` exists → Show "Download".
- **Feature Grid**: Clean 2-column list with small checkmark icons (inspired by weao.xyz).
- **Animation**: Modal expands from the card's position (layoutId).

### 3.3 Animated Platform Pills
**Goal**: Smooth, organic expansion.

**Interaction**:
1.  **Default**: 32px Circle with Icon (Windows/Apple).
2.  **Hover/Click**:
    -   Width expands smoothly (`ease-out`).
    -   Text fades in *after* expansion starts.
    -   Shows: `[Icon]  [Version Hash]  [Copy]`
3.  **Disengage**: Collapses back to circle immediately.

---

## Phase 4: Custom RDD Integration (Inject.Today Style)

**Goal**: Native download experience, no redirects.

**UI Design**:
- **Location**: `/tools/rdd`
- **Container**: Centered glass card (max-width: 500px).
- **Header**: "Roblox Data Downloader" (Bold, centered).
- **Form Elements**:
    -   **Channel**: Custom Dropdown (Live, Preview).
    -   **Binary**: Custom Dropdown (Windows, Mac).
    -   **Version**: Input with auto-fetch suggestion.
-   **Action**: Large "Generate Download Link" button.
-   **Output**: Instead of a terminal, use a clean **Toast Notification** or a **"Click to Start"** button that appears below.

**Technical Logic**:
-   Construct URL: `https://rdd.latte.to/?channel=...`
-   Trigger download via hidden `<iframe>` or `window.location.href` to avoid opening new tabs if possible, or open in new tab if cross-origin restrictions apply.

---

## Implementation Roadmap for Claude Code

1.  **Refine Cards**: Update [ExecutorCard.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorCard.tsx) to be compact.
2.  **Build Modal**: Create `ExecutorModal.tsx` with conditional logic.
3.  **Animate Pills**: Update [PlatformStatusPills.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/PlatformStatusPills.tsx) with Framer Motion `layout` prop.
4.  **Build RDD**: Create `/tools/rdd/page.tsx` with custom form.
