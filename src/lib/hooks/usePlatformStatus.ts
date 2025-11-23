import { useQuery } from "@tanstack/react-query";
import type { WeaoPlatformStatusResponse } from "@/types/weao";

export function usePlatformStatus() {
  return useQuery<WeaoPlatformStatusResponse>({
    queryKey: ["platform-status"],
    queryFn: async () => {
      const res = await fetch("/api/weao/status");

      if (!res.ok) {
        throw new Error("Failed to fetch platform status");
      }

      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
