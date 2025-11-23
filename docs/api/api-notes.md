# WEAO API Integration

This document describes how Key-Kingdom integrates with the WEAO (WhatExpsAre.Online) API to provide real-time executor status and Roblox version information.

## Overview

**Base URL**: `https://weao.xyz/api`
**Required Header**: `User-Agent: WEAO-3PService`

Key-Kingdom uses WEAO as the primary source for:
- Current Roblox versions per platform (Windows, Mac, Android, iOS)
- Executor working/not-working status
- Safety ratings (sUNC/UNC percentages)
- Executor metadata (pricing, links, features)

## Architecture

```
Client (Browser)
  “
Next.js API Routes (/api/weao/*)
  “
WEAO API (weao.xyz/api)
```

**Why proxy through Next.js?**
1. Add required `User-Agent` header
2. Avoid CORS issues
3. Implement caching to reduce API load
4. Handle rate limiting gracefully
5. Provide fallback data

## API Routes

### 1. Catch-All Proxy Route
**File**: `/src/app/api/weao/[...path]/route.ts`

**Purpose**: Generic proxy for all WEAO endpoints

**Caching**:
- Versions: 5 minutes
- Status: 2 minutes
- Default: 1 minute

**Usage**:
```ts
// Client code calls our proxy
fetch('/api/weao/versions/current')
  ’ proxies to ’ weao.xyz/api/versions/current

fetch('/api/weao/status/exploits')
  ’ proxies to ’ weao.xyz/api/status/exploits
```

### 2. Platform Status Route
**File**: `/src/app/api/weao/status/route.ts`

**Purpose**: Dedicated endpoint for platform status with structured response

**Endpoint**: `GET /api/weao/status`

**Response**:
```ts
{
  "Windows": {
    "platform": "Windows",
    "version": "version-612",
    "lastUpdated": "2025-11-23",
    "status": "stable"
  },
  "Mac": { ... },
  "Android": { ... },
  "iOS": { ... },
  "lastFetched": "2025-11-23T12:00:00Z"
}
```

**Caching**: 5 minutes with stale-while-revalidate fallback

## WEAO API Endpoints

### GET /versions/current
Returns current Roblox versions for all platforms.

**Response**:
```json
{
  "Windows": "version-612",
  "WindowsDate": "2025-11-23",
  "Mac": "version-612",
  "MacDate": "2025-11-23",
  "Android": "version-2.698.937",
  "AndroidDate": "2025-11-23",
  "iOS": "version-2.698.937",
  "iOSDate": "2025-11-23"
}
```

### GET /status/exploits
Returns array of all executor statuses.

**Response**: Array of `WeaoExploit` objects

**Key fields**:
```ts
{
  title: string;              // Executor name
  version: string;            // Executor version
  updatedDate: string;        // Last update (UTC)
  rbxversion: string;         // Roblox version it supports
  suncPercentage: number;     // Safety rating 0-100
  uncPercentage: number;      // UNC rating 0-100
  free: boolean;              // Is it free?
  cost?: string;              // Price string (e.g., "$20 Lifetime")
  purchaselink?: string;      // Purchase URL
  websitelink?: string;       // Website URL
  discordlink?: string;       // Discord URL
  platform: string;           // "Windows", "Mac", "Android", "iOS"
  updateStatus: boolean;      // Is it working?
  detected: boolean;          // Is it detected by Roblox?
}
```

### GET /status/exploits/[exploitName]
Returns status for a single executor by title.

**Example**: `/status/exploits/Solara`

## Client Integration

### 1. React Query Hooks

#### `useRobloxVersions()`
**File**: `/src/lib/hooks/useRobloxVersions.ts`

Fetches current Roblox versions for all platforms.

**Usage**:
```tsx
const { data: versions } = useRobloxVersions();
// versions.Windows = "version-612"
// versions.WindowsDate = "2025-11-23"
```

**Refetch interval**: 5 minutes

#### `useExecutors()`
**File**: `/src/lib/hooks/useExecutors.ts`

Fetches executors from internal DB and merges with live WEAO data.

**Data flow**:
1. Fetch base executors from `/api/executors` (database)
2. Fetch live data from `/api/weao/status/exploits` (WEAO)
3. Merge: WEAO data overwrites base data where available
4. Sort by sUNC descending (highest safety first)

**Refetch interval**: 2 minutes

### 2. Components

#### PlatformStatusPills
**File**: `/src/components/shop/PlatformStatusPills.tsx`

Shows platform status pills with expandable version info.

**Data source**: `useRobloxVersions()` ’ `/api/weao/versions/current`

**Displays**:
- Platform icon and name
- Status indicator (stable/partial/broken)
- On expand: version hash + last updated time

#### ExecutorTable / ExecutorRow
**File**: `/src/components/shop/ExecutorTable.tsx`, `/src/components/shop/ExecutorRow.tsx`

Shows executor marketplace table.

**Data source**: `useExecutors()` ’ merges `/api/executors` + `/api/weao/status/exploits`

**Displays**:
- Executor info (name, logo, description)
- sUNC rating (from WEAO)
- Status (working/not working from WEAO)
- Roblox version (from WEAO `rbxversion` field)
- Platform support (from WEAO `platform` field)
- Pricing (from WEAO `cost` and `purchaselink`)

## API Client Functions

**File**: `/src/lib/api/weao.ts`

### getRobloxCurrentVersions()
```ts
const versions = await getRobloxCurrentVersions();
// Returns: RobloxCurrentVersions
```

### getAllExploitStatuses()
```ts
const exploits = await getAllExploitStatuses();
// Returns: WeaoExploit[]
```

### getExploitStatusByTitle(exploitTitle)
```ts
const exploit = await getExploitStatusByTitle("Solara");
// Returns: WeaoExploit
```

## Caching Strategy

| Endpoint | Cache Duration | Rationale |
|----------|----------------|-----------|
| `/versions/current` | 5 minutes | Roblox updates are infrequent |
| `/status/exploits` | 2 minutes | Executor status changes more frequently |
| `/status/exploits/[name]` | 2 minutes | Same as above |

**Cache implementation**:
- In-memory cache in API route (simple Map)
- Stale-while-revalidate: return stale cache on error
- Cache headers: `X-Cache: HIT/MISS/STALE`

**React Query cache**:
- `staleTime` matches cache duration
- `refetchInterval` for background updates
- 3 retries with exponential backoff

## Error Handling

### API Route Level
```ts
try {
  const data = await fetch(weaoUrl);
  // Cache and return
} catch (error) {
  // Log error
  // Return stale cache if available
  // Otherwise 502 Bad Gateway
}
```

### Client Level (React Query)
```ts
{
  retry: 3,
  onError: (error) => {
    console.warn("WEAO fetch failed, using fallback", error);
  }
}
```

**Fallback behavior**:
- If WEAO is down, show base executor data from database
- Platform pills show loading state or cached data
- Gracefully degrade without breaking UI

## Rate Limiting

WEAO may rate limit requests. Our caching strategy reduces load:
- 5-minute cache = max 12 requests/hour per endpoint
- Multiple clients share server-side cache
- React Query deduplicates concurrent requests

**If rate limited**:
1. API route returns cached data (even if stale)
2. Client shows last known good state
3. Retry with exponential backoff
4. Log rate limit info for monitoring

## Data Merging Logic

**File**: `/src/lib/hooks/useExecutors.ts` ’ `mapWeaoToExecutor()`

Base executor (from DB) + WEAO data (live) = Merged executor

**Merge priority**:
- **sUNC**: WEAO `suncPercentage` overrides DB value
- **Status**: WEAO `updateStatus` and `rbxversion` overrides DB
- **Pricing**: WEAO `cost`, `purchaselink`, `free` overrides DB
- **Links**: WEAO `websitelink`, `discordlink` overrides DB
- **Platform**: WEAO `platform` field informs platform flags

**Why merge?**
- DB contains static metadata (logo, description, features)
- WEAO contains dynamic data (status, versions, pricing)
- Best of both: rich metadata + real-time status

## Monitoring & Debugging

### Check cache status
```bash
curl -I https://key-kingdom.org/api/weao/versions/current
# Look for X-Cache header: HIT, MISS, or STALE
```

### View raw WEAO data
```bash
curl -H "User-Agent: WEAO-3PService" https://weao.xyz/api/versions/current
curl -H "User-Agent: WEAO-3PService" https://weao.xyz/api/status/exploits
```

### Common issues
1. **Missing User-Agent**: WEAO may block or return different data
2. **Cache too aggressive**: Adjust TTL if data seems stale
3. **CORS errors**: Always proxy through Next.js API routes
4. **Rate limiting**: Check logs for rate limit messages

## Future Improvements

- [ ] Add Redis cache for multi-instance deployments
- [ ] Implement webhook support for instant updates
- [ ] Add monitoring/alerting for WEAO downtime
- [ ] Support WEAO API versioning
- [ ] Add metrics for cache hit rate
- [ ] Implement optimistic updates

## References

- WEAO Website: https://whatexpsare.online
- WEAO API: https://weao.xyz/api
- Project Spec: `/docs/APP_SPEC.md`
- Platform Pills: `/docs/reference/platform-pills-quickref.md`
