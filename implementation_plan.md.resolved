# Key-Kingdom UI/UX Implementation Plan

## Overview
Transform Key-Kingdom from cluttered table layout to clean card-based marketplace inspired by inject.today and key-empire.com.

**Total Estimated Time**: 8-12 hours
**Difficulty**: Medium
**Breaking Changes**: Yes (layout changes)

---

## Phase 1: Declutter & Polish (2-3 hours)

### 1.1 Add Loading Animation
**Goal**: Beautiful entry experience like inject.today's letter-by-letter reveal

**Files to Create**:
- `src/components/shared/LoadingIntro.tsx`

**Files to Modify**:
- [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx) - Add LoadingIntro wrapper

**Implementation**:
```typescript
// LoadingIntro.tsx - Letter-by-letter blur animation
- Use Framer Motion stagger
- Animate each letter from blur(8px) → blur(0px)
- Fade out after 1.5s, reveal main content
- Store "hasSeenIntro" in sessionStorage (only show once per session)
```

### 1.2 Remove Clutter
**Files to Modify**:
- [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx)

**Changes**:
- ✂️ Delete the info box: `"Compact table layout with collapsible rows..."`
- This is lines 67-72 in current [page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx)

### 1.3 Improve Platform Pills (Keep but Enhance)
**Goal**: Make version hashes copyable like inject.today

**Files to Modify**:
- [src/components/shop/PlatformStatusPills.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/PlatformStatusPills.tsx)

**Changes**:
```typescript
// Add copy functionality to version hash
- Add "Copy" button next to version hash in expanded pill
- Show toast notification on copy: "Version hash copied!"
- Style hash with monospace font, selectable text
- Add icon: lucide-react's Copy icon
```

**Keep pills visible** - They serve a purpose for showing current Roblox versions.

---

## Phase 2: Card Grid Layout (3-4 hours)

### 2.1 Create ExecutorCard Component
**Goal**: Replace table with clean card grid (3 columns desktop, 2 tablet, 1 mobile)

**Files to Create**:
- `src/components/shop/ExecutorCard.tsx`

**Component Structure**:
```typescript
<Card className="hover:scale-102 transition">
  {/* Logo/Icon - Large, centered */}
  <ExecutorLogo size="xl" />
  
  {/* Name - Bold, prominent */}
  <h3>{executor.name}</h3>
  
  {/* sUNC Badge - Large, glowing */}
  <SuncBadge size="lg" showGlow />
  
  {/* Status + Platforms - Compact row */}
  <div className="flex gap-2">
    <StatusDot working={executor.status.working} />
    <PlatformTags platforms={executor.platforms} compact />
  </div>
  
  {/* Price - If relevant */}
  <Price amount={executor.pricing.price} />
  
  {/* CTA on hover */}
  <HoverOverlay>
    <Button>View Details →</Button>
  </HoverOverlay>
</Card>
```

**Styling Notes**:
- Cards should have glassmorphism effect
- Hover: subtle elevation + glow
- Minimum height: 280px for consistency

### 2.2 Create ExecutorGrid Component
**Files to Create**:
- `src/components/shop/ExecutorGrid.tsx`

**Implementation**:
```typescript
// Grid with responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {executors.map((executor) => (
    <ExecutorCard key={executor.id} executor={executor} />
  ))}
</div>
```

### 2.3 Replace Table with Grid
**Files to Modify**:
- [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx)

**Changes**:
- Replace `<ExecutorTable executors={executors} />` 
- With `<ExecutorGrid executors={executors} />`

**Files to Archive** (don't delete yet, keep for reference):
- [src/components/shop/ExecutorTable.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorTable.tsx)
- [src/components/shop/ExecutorRow.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorRow.tsx)

---

## Phase 3: Executor Detail Pages (3-5 hours)

### 3.1 Create Detail Page Route
**Files to Create**:
- `src/app/executors/[slug]/page.tsx`
- `src/app/executors/[slug]/layout.tsx` (optional)

### 3.2 Create ExecutorDetailView Component
**Files to Create**:
- `src/components/executor/ExecutorDetailView.tsx`

**Layout Structure**:
```typescript
<div className="max-w-5xl mx-auto">
  {/* Breadcrumb */}
  <Breadcrumb>
    <Link href="/">Home</Link> > Executors > {executor.name}
  </Breadcrumb>
  
  {/* Hero Section */}
  <HeroSection>
    <ExecutorLogo size="2xl" />
    <h1 className="text-5xl">{executor.name}</h1>
    <SuncBadge size="xl" withMeter />
    <StatusBadge />
  </HeroSection>
  
  {/* Two-column layout */}
  <Grid cols={2} gap={8}>
    {/* Left: Info */}
    <div>
      <Description />
      <FeatureList features={executor.features} />
      <PlatformSupport />
    </div>
    
    {/* Right: Purchase */}
    <div className="sticky top-4">
      <PurchaseCard>
        <Price />
        <Button size="lg">Buy Now</Button>
        <Button variant="ghost">Visit Website</Button>
      </PurchaseCard>
      
      <StatusCard>
        <Label>Working</Label>
        <Label>Roblox Version</Label>
        <Label>Last Updated</Label>
      </StatusCard>
    </div>
  </Grid>
  
  {/* Full-width: Screenshots (if available) */}
  <ScreenshotCarousel images={executor.images} />
</div>
```

### 3.3 Update ExecutorCard to Link
**Files to Modify**:
- `src/components/shop/ExecutorCard.tsx`

**Changes**:
```typescript
// Wrap card content in Link
<Link href={`/executors/${executor.slug}`}>
  <Card>...</Card>
</Link>
```

---

## Phase 4: Search & Filters (2 hours) - Optional

### 4.1 Create FilterBar Component
**Files to Create**:
- `src/components/shop/FilterBar.tsx`

**Features**:
```typescript
<div className="flex gap-4 mb-6">
  <SearchInput 
    placeholder="Search executors..."
    onChange={handleSearch}
  />
  
  <FilterDropdown label="Platform">
    <option>All Platforms</option>
    <option>Windows</option>
    <option>Mac</option>
    <option>Mobile</option>
  </FilterDropdown>
  
  <FilterDropdown label="Status">
    <option>All</option>
    <option>Working</option>
    <option>Not Working</option>
  </FilterDropdown>
</div>
```

### 4.2 Add Filter Logic to Zustand Store
**Files to Modify**:
- [src/lib/store/appStore.ts](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/lib/store/appStore.ts)

**Add**:
```typescript
interface AppStore {
  searchQuery: string;
  platformFilter: Platform | 'all';
  statusFilter: 'all' | 'working' | 'broken';
  
  setSearchQuery: (query: string) => void;
  setPlatformFilter: (platform: Platform | 'all') => void;
  setStatusFilter: (status: 'all' | 'working' | 'broken') => void;
}
```

### 4.3 Filter Executors in Page
**Files to Modify**:
- [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx)

**Add filtering logic**:
```typescript
const { searchQuery, platformFilter, statusFilter } = useAppStore();

const filteredExecutors = useMemo(() => {
  return executors?.filter(executor => {
    // Search by name
    if (searchQuery && !executor.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by platform
    if (platformFilter !== 'all' && !executor.platforms[platformFilter]) {
      return false;
    }
    
    // Filter by status
    if (statusFilter === 'working' && !executor.status.working) return false;
    if (statusFilter === 'broken' && executor.status.working) return false;
    
    return true;
  });
}, [executors, searchQuery, platformFilter, statusFilter]);
```

---

## Technical Notes

### Color Palette (Keep Consistent)
```typescript
// Already defined in globals.css, maintain these
background.DEFAULT: #0B0E11
background.surface: #151A21
background.elevated: #1E2329
primary: #5865F2 (blurple)
success: #43B581
danger: #F04747
warning: #FAA61A
```

### Animation Guidelines
- **Duration**: 200-300ms for UI interactions
- **Easing**: `ease-out` for entries, `ease-in-out` for hovers
- **Loading**: 1-1.5s for intro animation
- **Respect**: `prefers-reduced-motion` media query

### Mobile Breakpoints
```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet (switch to 2-col grid)
lg: 1024px  // Desktop (3-col grid)
xl: 1280px  // Large desktop
```

---

## Testing Checklist

### After Phase 1:
- [ ] Loading animation appears on first visit
- [ ] Animation skipped on subsequent page loads (sessionStorage)
- [ ] Info box removed
- [ ] Platform pills have copy buttons
- [ ] Copy toast notification works

### After Phase 2:
- [ ] Card grid displays correctly on all screen sizes
- [ ] 3 columns on desktop (1024px+)
- [ ] 2 columns on tablet (768-1023px)
- [ ] 1 column on mobile (<768px)
- [ ] Cards have hover effects
- [ ] sUNC badges are prominent

### After Phase 3:
- [ ] Clicking card navigates to `/executors/[slug]`
- [ ] Detail page shows all executor info
- [ ] Breadcrumb navigation works
- [ ] Purchase buttons link correctly
- [ ] Back navigation preserves scroll position

### After Phase 4:
- [ ] Search filters executors in real-time
- [ ] Platform filter works
- [ ] Status filter works
- [ ] Filters combine correctly
- [ ] "No results" state shows when appropriate

---

## Deployment Notes

### Before Going Live:
1. Test on real devices (iOS Safari, Android Chrome)
2. Check loading performance (lighthouse score)
3. Verify all external links (purchase URLs)
4. Test with slow 3G connection
5. Ensure all images have alt text

### Rollback Plan:
If issues occur, revert these files:
- [src/app/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/page.tsx) (restore table)
- Remove new `/executors/[slug]` route
- Keep old [ExecutorTable.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorTable.tsx) as backup

---

## Questions for You

Before I start implementing:

1. **Do you want me to implement this** or do you prefer to send this to Claude Code?
2. **Which phase should we start with?** I recommend Phase 1 + 2 together.
3. **Any specific executors** you want me to test with? (Need real data)
4. **Screenshots/images** - Do you have executor screenshots ready, or should we skip the carousel initially?

Let me know and I'll get started! 🚀
