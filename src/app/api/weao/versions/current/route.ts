import { NextResponse } from "next/server";

const WEAO_VERSIONS_URL = "https://weao.gg/api/versions/current";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CachedData = {
  data: unknown;
  timestamp: number;
};

let cache: CachedData | null = null;

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

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const response = await fetch(WEAO_VERSIONS_URL, {
      headers: { "User-Agent": "WEAO-3PService" },
    });

    if (!response.ok) {
      console.warn(`WEAO returned ${response.status}, attempting fallback`);
      const fallbackData = await fallbackToClientSettings();
      cache = { data: fallbackData, timestamp: Date.now() };

      return NextResponse.json(fallbackData, {
        headers: {
          "X-Cache": "MISS",
          "X-Fallback": "clientsettings"
        },
      });
    }

    const data = await response.json();
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("WEAO error:", error);

    // Try fallback before returning error
    try {
      const fallbackData = await fallbackToClientSettings();
      cache = { data: fallbackData, timestamp: Date.now() };

      return NextResponse.json(fallbackData, {
        headers: {
          "X-Cache": "MISS",
          "X-Fallback": "clientsettings-error"
        },
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return NextResponse.json({ error: "Failed" }, { status: 502 });
    }
  }
}
