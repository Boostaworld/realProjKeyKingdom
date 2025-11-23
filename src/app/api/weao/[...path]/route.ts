import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = "https://weao.xyz/api";

const CACHE_TTL_MS = {
  versions: 5 * 60 * 1000, // 5 minutes
  status: 2 * 60 * 1000, // 2 minutes
};

const memoryCache = new Map<
  string,
  { data: unknown; timestamp: number; status: number }
>();

function getTtlForPath(path: string): number {
  if (path.startsWith("versions")) return CACHE_TTL_MS.versions;
  if (path.startsWith("status")) return CACHE_TTL_MS.status;
  return 60 * 1000; // default 1 min
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${UPSTREAM_BASE}/${path}`;
  const ttl = getTtlForPath(path);

  const cached = memoryCache.get(path);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "WEAO-3PService" },
    });

    const data = await upstream.json();
    const status = upstream.status;

    if (upstream.ok) {
      memoryCache.set(path, {
        data,
        status,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(data, {
      status,
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("WEAO proxy error:", error);
    return NextResponse.json(
      { error: "Failed to reach WEAO API" },
      { status: 502 }
    );
  }
}
