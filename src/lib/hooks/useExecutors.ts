import { useQuery } from "@tanstack/react-query";
import type { Executor } from "@/types/executor";
import {
  getAllExploitStatuses,
  type WeaoExploit,
} from "@/lib/api/weao";

function normalizeTitle(str: string) {
  return str.trim().toLowerCase();
}

function mapWeaoToExecutor(
  base: Executor,
  weao: WeaoExploit | undefined
): Executor {
  if (!weao) return base;

  const sunc = typeof weao.suncPercentage === "number"
    ? weao.suncPercentage
    : base.suncRating;

  // Map platform string into flags
  const platform = weao.platform.toLowerCase();
  const platforms = {
    windows: platform === "windows" || base.platforms.windows,
    mac: platform === "mac" || base.platforms.mac,
    mobile:
      platform === "android" ||
      platform === "ios" ||
      base.platforms.mobile,
    android: platform === "android" || base.platforms.android,
  };

  return {
    ...base,
    suncRating: sunc,
    status: {
      ...base.status,
      working: !!weao.updateStatus,
      robloxVersion: weao.rbxversion ?? base.status.robloxVersion,
      lastChecked: new Date(weao.updatedDate ?? base.status.lastChecked),
    },
    pricing: {
      ...base.pricing,
      type: weao.free ? "free" : "paid",
      rawCostString: weao.cost ?? base.pricing.rawCostString,
      purchaseUrl: weao.purchaselink ?? base.pricing.purchaseUrl,
    },
    links: {
      ...base.links,
      website: weao.websitelink ?? base.links?.website,
      discord: weao.discordlink ?? base.links?.discord,
    },
    platforms,
  };
}

/**
 * CRITICAL: Always sorts by sUNC descending (highest safety first)
 * This is the ONLY sorting for the main marketplace table
 */
export function sortExecutorsBySUNC(executors: Executor[]): Executor[] {
  return [...executors].sort((a, b) => {
    // 1) sUNC descending (highest first)
    const sDiff = b.suncRating - a.suncRating;
    if (sDiff !== 0) return sDiff;

    // 2) working status (working first)
    if (a.status.working !== b.status.working) {
      return a.status.working ? -1 : 1;
    }

    // 3) name ascending
    return a.name.localeCompare(b.name);
  });
}

export function useExecutors() {
  return useQuery({
    queryKey: ["executors"],
    queryFn: async (): Promise<Executor[]> => {
      // Step 1: Get base executors from our own API (DB / static)
      const baseRes = await fetch("/api/executors");
      if (!baseRes.ok) {
        throw new Error("Failed to fetch base executors");
      }
      const baseExecutors: Executor[] = await baseRes.json();

      // Step 2: Get live WEAO data
      let weaoExecutors: WeaoExploit[] = [];
      try {
        weaoExecutors = await getAllExploitStatuses();
      } catch (error) {
        console.warn("WEAO fetch failed, falling back to base data", error);
        return sortExecutorsBySUNC(baseExecutors);
      }

      const byTitle = new Map<string, WeaoExploit>();
      for (const exploit of weaoExecutors) {
        byTitle.set(normalizeTitle(exploit.title), exploit);
      }

      const merged = baseExecutors.map((executor) => {
        const weao = byTitle.get(normalizeTitle(executor.name));
        return mapWeaoToExecutor(executor, weao);
      });

      return sortExecutorsBySUNC(merged);
    },
    // WEAO suggests not hammering their endpoints; 2–5 minutes is reasonable
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    staleTime: 2 * 60 * 1000,
  });
}
