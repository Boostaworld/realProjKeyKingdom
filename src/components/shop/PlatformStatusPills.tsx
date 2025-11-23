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

  if (isLoading || !versions) {
    return (
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(platformConfig) as PlatformKey[]).map((platform) => (
          <div
            key={platform}
            className="h-10 px-4 rounded-lg bg-background-elevated animate-pulse"
            style={{ width: "120px" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(platformConfig) as PlatformKey[]).map((platform) => {
          const Icon = platformConfig[platform].icon;
          const isExpanded = expanded === platform;
          const versionDate = versions[`${platform}Date` as keyof typeof versions] as string;

          return (
            <motion.button
              key={platform}
              onClick={() => toggleExpand(platform)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all glass-pill",
                isExpanded && "border-primary/60"
              )}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">
                {platformConfig[platform].label}
              </span>
              <div className="h-2 w-2 rounded-full bg-success" />
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Version Info */}
      <AnimatePresence>
        {expanded && versions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden glass-card p-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text-primary">
                  {platformConfig[expanded].label} Version
                </h4>
                <span className="text-xs text-success font-medium">
                  Stable
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-text-muted">Version Hash</div>
                <code className="text-sm font-mono text-text-primary bg-background-elevated px-2 py-1 rounded block">
                  {versions[expanded]}
                </code>
              </div>

              <div className="text-xs text-text-muted">
                Updated {formatRelativeTime(new Date(versions[`${expanded}Date` as keyof typeof versions] as string))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
