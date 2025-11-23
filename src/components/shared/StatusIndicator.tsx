"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { ExecutorStatus } from "@/types/executor";

interface StatusIndicatorProps {
  status: ExecutorStatus;
  compact?: boolean;
  showPulse?: boolean;
}

export function StatusIndicator({
  status,
  compact = false,
  showPulse = true
}: StatusIndicatorProps) {
  const { working, robloxVersion, lastChecked } = status;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {/* Pulsing status dot with glow */}
        <div className="relative flex h-3 w-3">
          {showPulse && (
            <motion.span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                working ? "bg-success" : "bg-danger"
              )}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.75, 0, 0.75],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-3 w-3 rounded-full",
              working ? "status-dot-working" : "status-dot-broken"
            )}
          />
        </div>

        <span
          className={cn(
            "font-medium text-sm",
            working ? "text-success" : "text-danger"
          )}
        >
          {working ? "Working" : "Not Working"}
        </span>
      </div>

      {!compact && (
        <>
          <div className="text-xs text-text-muted font-mono">
            {robloxVersion}
          </div>
          <div className="text-xs text-text-muted">
            Updated {formatRelativeTime(lastChecked)}
          </div>
        </>
      )}
    </div>
  );
}
