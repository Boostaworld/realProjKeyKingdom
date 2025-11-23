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
        {/* Pulsing status dot */}
        <div className="relative flex h-3 w-3">
          {working && showPulse && (
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75"
              animate={{
                scale: [1, 1.5, 1],
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
              working ? "bg-success" : "bg-danger"
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
