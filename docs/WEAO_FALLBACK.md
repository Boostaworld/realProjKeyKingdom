# WEAO API Integration with Fallback

**Last Updated:** 2025-11-23

---

## Overview

Key-Kingdom integrates with the WEAO API for real-time Roblox version information and executor status data. To ensure reliability, we implement a graceful fallback mechanism to Roblox's official clientsettings API when WEAO is unavailable.

---

## WEAO Integration

### Primary Data Source

WEAO (https://weao.gg) provides:
- Real-time Roblox version hashes for all platforms (Windows, Mac, Android, iOS)
- Executor working status
- Last update timestamps
- sUNC/UNC ratings

### API Routes

Our Next.js API proxies WEAO to avoid CORS issues and add caching:

```
/api/weao/versions/current    - Current Roblox versions for all platforms
/api/weao/status/exploits      - All executor statuses
/api/weao/status               - General status endpoint
```

### Required Headers

All WEAO requests must include:
```
User-Agent: WEAO-3PService
```

Without this header, WEAO returns 403 Forbidden.

---

## Fallback Mechanism

### When Fallback Activates

The fallback to Roblox clientsettings API triggers when:

1. **WEAO returns non-2xx status** (e.g., 502 Bad Gateway, 503 Service Unavailable)
2. **Network errors** (timeout, connection refused, DNS failure)
3. **Response parsing failures** (invalid JSON, missing expected fields)

### Fallback Implementation

Location: `src/app/api/weao/versions/current/route.ts`

```typescript
async function fallbackToClientSettings() {
  console.log("Falling back to Roblox clientsettings API");

  const platforms = ["WindowsPlayer", "MacPlayer", "Android", "iOS"];
  const versions: Record<string, string> = {};
  const dates: Record<string, string> = {};

  for (const platform of platforms) {
    try {
      const url = `https://clientsettings.roblox.com/v2/client-version/${platform}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        const version = data.clientVersionUpload || data.version || "";
        const platformKey = platform.replace("Player", "");

        versions[platformKey] = version;
        dates[`${platformKey}Date`] = new Date().toISOString();
      }
    } catch (err) {
      console.error(`Failed to fetch ${platform} from clientsettings:`, err);
    }
  }

  return {
    Windows: versions.Windows || "",
    WindowsDate: dates.WindowsDate || new Date().toISOString(),
    Mac: versions.Mac || "",
    MacDate: dates.MacDate || new Date().toISOString(),
    Android: versions.Android || "",
    AndroidDate: dates.AndroidDate || new Date().toISOString(),
    iOS: versions.iOS || "",
    iOSDate: dates.iOSDate || new Date().toISOString(),
  };
}
```

### Response Headers

When fallback is used, we add custom headers to identify the data source:

```
X-Fallback: clientsettings           - Fallback due to non-OK status
X-Fallback: clientsettings-error     - Fallback due to network error
```

---

## RDD Version Resolution

RDD (Roblox Deployment Downloader) also implements a fallback for version resolution:

Location: `src/app/api/rdd/manifest/route.ts`

### Resolution Strategy

1. **Explicit version provided**: Use as-is (no API call needed)
2. **Latest version requested**:
   - Try Roblox clientsettings v2 API first
   - Fall back to v1 API if v2 fails
   - Return resolved version hash

### Endpoints Used

```
# Preferred (v2)
https://clientsettings.roblox.com/v2/client-version/{platform}
https://clientsettings.roblox.com/v2/client-version/{platform}/channel/{channel}

# Fallback (v1)
https://clientsettings.roblox.com/v1/client-version/{platform}
https://clientsettings.roblox.com/v1/client-version/{platform}/channel/{channel}
```

### Platform Mapping

| RDD binaryType    | clientsettings platform |
|-------------------|-------------------------|
| WindowsPlayer     | WindowsPlayer          |
| WindowsStudio64   | WindowsPlayer          |
| MacPlayer         | MacPlayer              |
| MacStudio         | MacPlayer              |

---

## Caching Strategy

### Cache Duration

- **WEAO versions**: 5 minutes (300,000ms)
- **In-memory cache**: Single cached object per route
- **Cache invalidation**: Time-based (TTL)

### Cache Headers

Responses include cache status:

```
X-Cache: HIT    - Served from cache
X-Cache: MISS   - Fresh fetch from upstream
```

---

## Error Handling

### Logging

All errors are logged with context:

```typescript
console.error('[RDD] Manifest proxy error:', {
  platform,
  channel,
  version,
  error: errorMessage,
  stack: error instanceof Error ? error.stack : undefined,
});
```

### User-Facing Errors

When both WEAO and fallback fail:

```json
{
  "error": "Failed to fetch from Roblox CDN",
  "detail": "Specific error message here"
}
```

HTTP Status: `502 Bad Gateway`

---

## Testing

### Manual Testing

Test WEAO with fallback:

```bash
# Test WEAO endpoint
curl http://localhost:3000/api/weao/versions/current

# Simulate WEAO failure (if you can temporarily block weao.gg):
# Should see X-Fallback header and still get valid data
```

### Expected Behavior

| Scenario | Expected Result |
|----------|-----------------|
| WEAO up | Data from WEAO, no fallback header |
| WEAO returns 502 | Data from clientsettings, `X-Fallback: clientsettings` |
| WEAO network error | Data from clientsettings, `X-Fallback: clientsettings-error` |
| Both fail | 502 error with detail message |

---

## Monitoring

### Key Metrics

Monitor these in production logs:

1. **WEAO success rate**: How often WEAO responds successfully
2. **Fallback activation rate**: How often we fall back to clientsettings
3. **Total failure rate**: How often both sources fail
4. **Response times**: WEAO vs fallback performance

### Log Patterns

```
[INFO] [RDD] Resolving version for WindowsPlayer on LIVE channel
[WARN] WEAO returned 502, attempting fallback
[INFO] Falling back to Roblox clientsettings API
[SUCCESS] Resolved version: version-abc123def456
```

---

## Future Improvements

### Potential Enhancements

1. **Multiple fallback sources**: Add more version data sources
2. **Retry logic**: Retry WEAO with exponential backoff before fallback
3. **Health checks**: Periodic WEAO health monitoring
4. **Metrics dashboard**: Track fallback rates and data source reliability
5. **Cache warming**: Pre-fetch and cache version data proactively
6. **Distributed caching**: Use Redis/Vercel KV for shared cache across instances

---

## Related Documentation

- `docs/RDD_IMPLEMENTATION.md` - RDD integration details
- `docs/api/api-notes.md` - General API notes
- `src/lib/api/weao.ts` - WEAO client library
