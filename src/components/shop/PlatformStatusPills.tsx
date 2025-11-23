"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { useRobloxVersions } from "@/lib/hooks/useRobloxVersions";
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

  const toggleExpand = (platform: PlatformKey) => {
    setExpanded(expanded === platform ? null : platform);
  };

  const platforms = Object.keys(platformConfig) as PlatformKey[];

  return (
    <div className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        {platforms.map((platform) => {
          const Icon = platformConfig[platform].icon;
          const isExpanded = expanded === platform;
          const versionHash = versions?.[platform];
          const updatedAt = versions?.[`${platform}Date` as keyof typeof versions] as string | undefined;

          return (
            <motion.button
              key={platform}
              onClick={() => toggleExpand(platform)}
              className={cn(
                "flex min-w-[140px] items-center justify-between gap-2 rounded-full px-4 py-2",
                "glass-surface glass-surface-hover border-white/10 shadow-glass",
                isExpanded && "border-primary/60 shadow-glass-hover"
              )}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading && !versions}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                  {platformConfig[platform].label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {versionHash ? (
                  <span className="font-mono text-text-secondary">{versionHash.slice(0, 6)}</span>
                ) : (
                  <span className="font-mono text-text-muted">…</span>
                )}
                <span
                  className="h-2 w-2 rounded-full bg-success shadow-[0_0_12px_rgba(67,181,129,0.6)]"
                  aria-hidden
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Version Info */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden rounded-xl border border-white/10 bg-[rgba(21,26,33,0.85)] p-4 backdrop-blur-2xl shadow-glass"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text-primary">
                  {platformConfig[expanded].label} Version
                </h4>
                <span className="text-xs text-success font-medium">Stable</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-text-muted">Version Hash</div>
                <code className="block rounded-lg bg-[rgba(30,35,41,0.65)] px-3 py-2 font-mono text-sm text-text-primary border border-white/10">
                  {versions?.[expanded] ?? "Awaiting data"}
                </code>
              </div>

              <div className="text-xs text-text-muted">
                {updatedAt
                  ? `Updated ${formatRelativeTime(new Date(updatedAt))}`
                  : "Awaiting latest check"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
