import { NextResponse } from "next/server";

const WEAO_VERSIONS_URL = "https://weao.gg/api/versions/current";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CachedData = {
  data: unknown;
  timestamp: number;
};

let cache: CachedData | null = null;

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const response = await fetch(WEAO_VERSIONS_URL, {
      headers: { "User-Agent": "WEAO-3PService" },
      next: { revalidate: CACHE_TTL_MS / 1000 },
    });

    if (!response.ok) {
      if (response.status === 502) {
        console.error("WEAO upstream returned 502 for /versions/current");
      }
      throw new Error(`WEAO API returned ${response.status}`);
    }

    const data = await response.json();
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("WEAO API error:", error);

    if (cache) {
      return NextResponse.json(cache.data, {
        status: 200,
        headers: {
          "X-Cache": "STALE",
          "X-Error": "Failed to fetch fresh WEAO versions, using cached data",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch from WEAO" },
      { status: 502 }
    );
  }
}
