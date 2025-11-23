"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { useRobloxVersions } from "@/lib/hooks/useRobloxVersions";
import { usePlatformStatus } from "@/lib/hooks/usePlatformStatus";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

type PlatformKey = "Windows" | "Mac" | "Android" | "iOS";

const platformConfig = {
  Windows: { icon: Monitor, label: "Windows" },
  Mac: { icon: Monitor, label: "Mac" },
  Android: { icon: Smartphone, label: "Android" },
  iOS: { icon: Smartphone, label: "iOS" },
};

export function PlatformStatusPills() {
  const [expanded, setExpanded] = useState<PlatformKey | null>(null);
  const { data: versions, isLoading } = useRobloxVersions();
  const {
    data: platformStatuses,
    isLoading: isStatusLoading,
    isError: statusError,
  } = usePlatformStatus();

  const toggleExpand = (platform: PlatformKey) => {
    setExpanded(expanded === platform ? null : platform);
  };

  const platforms = Object.keys(platformConfig) as PlatformKey[];
  const expandedStatus = expanded ? platformStatuses?.[expanded] : null;
  const expandedUpdatedAt = expandedStatus?.lastUpdated ??
    (expanded
      ? (versions?.[`${expanded}Date` as keyof typeof versions] as
          | string
          | undefined)
      : undefined);

  const statusBadgeStyles = {
    stable: "bg-success/15 text-success border-success/40 shadow-[0_0_8px_rgba(67,181,129,0.35)]",
    partial: "bg-warning/15 text-warning border-warning/40 shadow-[0_0_8px_rgba(255,183,77,0.35)]",
    broken: "bg-danger/15 text-danger border-danger/40 shadow-[0_0_8px_rgba(244,67,54,0.35)]",
    unknown: "bg-white/5 text-text-secondary border-white/10",
  } as const;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {platforms.map((platform) => {
          const Icon = platformConfig[platform].icon;
          const isExpanded = expanded === platform;
          const versionHash = platformStatuses?.[platform]?.version ?? versions?.[platform];
          const statusLabel = (platformStatuses?.[platform]?.status ?? "unknown") as keyof typeof statusBadgeStyles;

          return (
            <motion.button
              key={platform}
              onClick={() => toggleExpand(platform)}
              className={cn(
                "group flex min-w-[160px] items-center justify-between gap-3 rounded-full px-4 py-2",
                "bg-gradient-to-br from-[rgba(21,26,33,0.9)] to-[rgba(30,35,41,0.9)]",
                "backdrop-blur-xl border border-white/10 shadow-glass transition-all duration-200",
                isExpanded && "border-primary/50 shadow-glass-hover"
              )}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 10px 28px rgba(88, 101, 242, 0.28)",
              }}
              whileTap={{ scale: 0.98 }}
              disabled={(isLoading && !versions) || (isStatusLoading && !platformStatuses)}
              aria-pressed={isExpanded}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <Icon className="h-4 w-4 text-text-secondary" />
                </div>
                <span className="text-sm font-medium text-text-primary">{platformConfig[platform].label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
                    statusBadgeStyles[statusLabel] ?? statusBadgeStyles.unknown
                  )}
                >
                  {statusLabel}
                </span>
                <div className="flex items-center gap-1">
                  {versionHash ? (
                    <span className="font-mono text-text-secondary">{versionHash.slice(0, 6)}</span>
                  ) : (
                    <span className="font-mono text-text-muted">…</span>
                  )}
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_12px_rgba(67,181,129,0.6)] animate-pulse"
                    aria-hidden
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden rounded-xl border border-white/10 backdrop-blur-xl shadow-glass"
            style={{
              background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.85) 0%, rgba(30, 35, 41, 0.85) 100%)',
            }}
          >
              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {platformConfig[expanded].label} Version
                  </h4>
                  <span
                    className={cn(
                      "text-xs font-semibold capitalize rounded-full border px-2 py-0.5",
                      statusBadgeStyles[
                        (expandedStatus?.status as keyof typeof statusBadgeStyles) ?? "unknown"
                      ]
                    )}
                  >
                    {expandedStatus?.status ?? "unknown"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-text-muted">Version Hash</div>
                  <code className="block rounded-lg px-3 py-1.5 font-mono text-sm text-text-primary border border-white/10 backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 35, 41, 0.65) 0%, rgba(21, 26, 33, 0.65) 100%)',
                    }}
                  >
                  {platformStatuses?.[expanded]?.version ?? versions?.[expanded] ?? "Awaiting data"}
                  </code>
                </div>

                <div className="text-xs text-text-muted">
                  {expandedUpdatedAt
                    ? `Updated ${formatRelativeTime(new Date(expandedUpdatedAt))}`
                    : "Awaiting latest check"}
                </div>

                <div className="text-xs text-text-secondary leading-relaxed bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                  {statusError
                    ? "WEAO status temporarily unavailable; showing cached Roblox version data."
                    : `Live Roblox platform data via WEAO (last sync ${formatRelativeTime(
                        new Date(platformStatuses?.lastFetched ?? new Date())
                      )}).`}
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
