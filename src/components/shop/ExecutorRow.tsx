"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { SuncBadge } from "@/components/shared/SuncBadge";
import { formatPrice, formatRelativeTime } from "@/lib/utils/formatters";
import type { Executor } from "@/types/executor";

interface ExecutorRowProps {
  executor: Executor;
}

export function ExecutorRow({ executor }: ExecutorRowProps) {
  const [expanded, setExpanded] = useState(false);

  const platforms = useMemo(
    () =>
      Object.entries(executor.platforms)
        .filter(([, supported]) => supported)
        .map(([platform]) => platform),
    [executor.platforms]
  );

  const handlePurchase = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!executor.pricing.purchaseUrl) return;
    window.open(executor.pricing.purchaseUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <motion.tr
        className="cursor-pointer border-b border-white/5 bg-background-tertiary/40 transition-colors duration-200 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10"
        onClick={() => setExpanded((prev) => !prev)}
        whileHover={{ backgroundColor: "rgba(88, 101, 242, 0.06)" }}
      >
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-muted"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary text-lg font-bold">
              {executor.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-text-primary">{executor.name}</div>
              <div className="truncate text-xs text-text-muted">{executor.description}</div>
            </div>
          </div>
        </td>

        <td className="px-4 py-2.5 text-center">
          <div className="flex justify-center">
            <SuncBadge rating={executor.suncRating} size="sm" showLabel={false} showGlow={false} />
          </div>
        </td>

        <td className="px-4 py-2.5 text-center">
          <div className="flex items-center justify-center">
            <div
              className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                executor.status.working ? "bg-success" : "bg-danger"
              }`}
            />
          </div>
        </td>

        <td className="px-4 py-2.5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-text-secondary">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="rounded-md bg-background-secondary px-2 py-1 capitalize"
              >
                {platform}
              </span>
            ))}
          </div>
        </td>

        <td className="px-4 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-text-primary">
            <Star className="h-4 w-4 text-warning" />
            <span>{executor.rating.average.toFixed(1)}</span>
            <span className="text-xs text-text-muted">({executor.rating.count})</span>
          </div>
        </td>

        <td className="px-4 py-2.5 text-center">
          <span className="font-medium text-text-primary">
            {executor.pricing.rawCostString ||
              formatPrice(executor.pricing.price, executor.pricing.currency)}
          </span>
        </td>

        <td className="px-4 py-2.5 text-right">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/80"
            onClick={handlePurchase}
          >
            {executor.pricing.price ? "Buy Now" : "Download"}
          </button>
        </td>
      </motion.tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background-secondary/40"
          >
            <td colSpan={7} className="px-4 py-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text-primary">About</h3>
                  <p className="text-sm text-text-secondary">
                    {executor.longDescription || executor.description}
                  </p>

                  {executor.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">Key Features</h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-text-secondary">
                        {executor.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text-primary">Status Details</h3>
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex justify-between rounded-lg border border-white/5 bg-background-tertiary/60 px-3 py-2">
                      <span>Working</span>
                      <span className={executor.status.working ? "text-success" : "text-danger"}>
                        {executor.status.working ? "Operational" : "Offline"}
                      </span>
                    </div>
                    <div className="flex justify-between rounded-lg border border-white/5 bg-background-tertiary/60 px-3 py-2">
                      <span>Roblox Version</span>
                      <span className="font-mono text-text-primary">
                        {executor.status.robloxVersion}
                      </span>
                    </div>
                    <div className="flex justify-between rounded-lg border border-white/5 bg-background-tertiary/60 px-3 py-2">
                      <span>Last Updated</span>
                      <span>{formatRelativeTime(executor.status.lastChecked)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
