import { NextResponse } from "next/server";

const WEAO_BASE_URL = "https://weao.xyz/api";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: unknown;
  timestamp: number;
}

let cache: CachedData | null = null;

export interface PlatformStatus {
  platform: string;
  version: string;
  lastUpdated: string;
  status: "stable" | "partial" | "broken";
}

export interface WeaoPlatformStatusResponse {
  Windows: PlatformStatus;
  Mac: PlatformStatus;
  Android: PlatformStatus;
  iOS: PlatformStatus;
  lastFetched: string;
}

/**
 * GET /api/weao/status
 *
 * Returns platform status for all Roblox platforms.
 * Fetches from WEAO API and caches for 5 minutes.
 */
export async function GET() {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    // Fetch current versions from WEAO
    const response = await fetch(`${WEAO_BASE_URL}/versions/current`, {
      headers: { "User-Agent": "WEAO-3PService" },
    });

    if (!response.ok) {
      throw new Error(`WEAO API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform into platform status format
    const platformStatus: WeaoPlatformStatusResponse = {
      Windows: {
        platform: "Windows",
        version: data.Windows || "unknown",
        lastUpdated: data.WindowsDate || new Date().toISOString(),
        status: "stable",
      },
      Mac: {
        platform: "Mac",
        version: data.Mac || "unknown",
        lastUpdated: data.MacDate || new Date().toISOString(),
        status: "stable",
      },
      Android: {
        platform: "Android",
        version: data.Android || "unknown",
        lastUpdated: data.AndroidDate || new Date().toISOString(),
        status: "stable",
      },
      iOS: {
        platform: "iOS",
        version: data.iOS || "unknown",
        lastUpdated: data.iOSDate || new Date().toISOString(),
        status: "stable",
      },
      lastFetched: new Date().toISOString(),
    };

    // Update cache
    cache = {
      data: platformStatus,
      timestamp: Date.now(),
    };

    return NextResponse.json(platformStatus, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("WEAO status fetch error:", error);

    // Return cached data if available, even if expired
    if (cache) {
      return NextResponse.json(cache.data, {
        status: 200,
        headers: {
          "X-Cache": "STALE",
          "X-Error": "Failed to fetch fresh data, returning stale cache"
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch platform status from WEAO API" },
      { status: 502 }
    );
  }
}
