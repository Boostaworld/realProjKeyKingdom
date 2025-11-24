"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Monitor, Smartphone, Copy, Check } from "lucide-react";
import { useRobloxVersions } from "@/lib/hooks/useRobloxVersions";
import { usePlatformStatus } from "@/lib/hooks/usePlatformStatus";
import { cn } from "@/lib/utils/cn";

type PlatformKey = "Windows" | "Mac" | "Android" | "iOS";

const platformConfig = {
  Windows: { icon: Monitor, label: "Windows" },
  Mac: { icon: Monitor, label: "Mac" },
  Android: { icon: Smartphone, label: "Android" },
  iOS: { icon: Smartphone, label: "iOS" },
};

// Animation variants for expanding circle
const pillVariants = {
  collapsed: { width: 32, borderRadius: 999 },
  expanded: { width: "auto", borderRadius: 8 },
};

export function PlatformStatusPills() {
  const [expanded, setExpanded] = useState<PlatformKey | null>(null);
  const [copied, setCopied] = useState<PlatformKey | null>(null);
  const { data: versions, isLoading } = useRobloxVersions();
  const { data: platformStatuses } = usePlatformStatus();

  const toggleExpand = (platform: PlatformKey) => {
    setExpanded(expanded === platform ? null : platform);
  };

  const handleCopy = (platform: PlatformKey, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const platforms = Object.keys(platformConfig) as PlatformKey[];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {platforms.map((platform) => {
        const Icon = platformConfig[platform].icon;
        const isExpanded = expanded === platform;
        const versionHash = platformStatuses?.[platform]?.version ?? versions?.[platform] ?? "";
        const isCopied = copied === platform;

        return (
          <motion.div
            key={platform}
            variants={pillVariants}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex h-8 items-center overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md"
          >
            {/* Icon - Always Visible */}
            <div
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
              onClick={() => toggleExpand(platform)}
            >
              <Icon size={16} className="text-text-secondary" />
            </div>

            {/* Content - Fades In */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 whitespace-nowrap pl-1 pr-3 text-xs font-mono"
                >
                  <span className="text-text-primary">
                    {isLoading && !versionHash ? "Loading..." : versionHash || "N/A"}
                  </span>
                  <button
                    onClick={() => handleCopy(platform, versionHash)}
                    className="rounded p-0.5 transition hover:bg-white/10"
                    title="Copy version hash"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3 text-text-muted" />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
