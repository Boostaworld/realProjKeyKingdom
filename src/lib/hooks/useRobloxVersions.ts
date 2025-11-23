import { useQuery } from "@tanstack/react-query";
import { getRobloxCurrentVersions, type RobloxCurrentVersions } from "@/lib/api/weao";

export function useRobloxVersions() {
  return useQuery({
    queryKey: ["roblox-versions"],
    queryFn: getRobloxCurrentVersions,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}
