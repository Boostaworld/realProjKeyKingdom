// WEAO API Client - calls Next.js proxy routes

export interface RobloxCurrentVersions {
  Windows: string;
  WindowsDate: string;
  Mac: string;
  MacDate: string;
  Android: string;
  AndroidDate: string;
  iOS: string;
  iOSDate: string;
}

export interface WeaoExploit {
  title: string;
  version: string;
  updatedDate: string;
  rbxversion: string;
  suncPercentage?: number;
  uncPercentage?: number;
  free: boolean;
  cost?: string;
  purchaselink?: string;
  websitelink?: string;
  discordlink?: string;
  platform: string; // "Windows", "Mac", "Android", "iOS", etc.
  updateStatus: boolean;
  detected: boolean;
  keysystem?: boolean;
}

const WEAO_PROXY_BASE = "/api/weao";

function logProxyStatus(endpoint: string, res: Response) {
  if (res.status === 502) {
    console.error(`WEAO proxy returned 502 for ${endpoint}`, {
      statusText: res.statusText,
    });
  }
}

export async function getRobloxCurrentVersions(): Promise<RobloxCurrentVersions> {
  const res = await fetch(`${WEAO_PROXY_BASE}/versions/current`);

  if (!res.ok) {
    logProxyStatus("/versions/current", res);
    throw new Error("Failed to fetch Roblox versions");
  }

  return res.json();
}

export async function getAllExploitStatuses(): Promise<WeaoExploit[]> {
  const res = await fetch(`${WEAO_PROXY_BASE}/status/exploits`);

  if (!res.ok) {
    logProxyStatus("/status/exploits", res);
    if (res.status === 429) {
      const data = await res.json();
      throw new Error(
        `WEAO rate limit. RemainingTime=${data?.rateLimitInfo?.remainingTime ?? "unknown"}`
      );
    }
    throw new Error(`Failed to fetch exploit statuses (${res.status})`);
  }

  return res.json();
}

export async function getExploitStatusByTitle(
  exploitTitle: string
): Promise<WeaoExploit> {
  const res = await fetch(
    `${WEAO_PROXY_BASE}/status/exploits/${encodeURIComponent(exploitTitle)}`
  );

  if (!res.ok) {
    logProxyStatus(`/status/exploits/${exploitTitle}`, res);
    throw new Error(`Failed to fetch exploit status for ${exploitTitle}`);
  }

  return res.json();
}
