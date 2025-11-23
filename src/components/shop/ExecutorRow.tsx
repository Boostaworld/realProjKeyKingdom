"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SuncBadge } from "@/components/shared/SuncBadge";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatPrice, formatRelativeTime } from "@/lib/utils/formatters";
import { useAppStore } from "@/lib/store/appStore";
import { cn } from "@/lib/utils/cn";
import type { Executor } from "@/types/executor";

interface ExecutorRowProps {
  executor: Executor;
  index: number;
}

export function ExecutorRow({ executor, index }: ExecutorRowProps) {
  const router = useRouter();
  const { expandedRow, setExpandedRow } = useAppStore();
  const isExpanded = expandedRow === executor.id;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRow(isExpanded ? null : executor.id);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!executor.pricing.purchaseUrl) return;
    window.open(executor.pricing.purchaseUrl, "_blank", "noopener,noreferrer");
  };

  const platforms = Object.entries(executor.platforms)
    .filter(([, supported]) => supported)
    .map(([platform]) => platform);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="border-b border-white/5"
    >
      <td colSpan={8} className="p-0">
        <div>
          {/* Main Row */}
          <motion.div
            className={cn(
              "grid grid-cols-[1fr,80px,150px,120px,120px,100px,100px,140px] gap-4 px-4 py-3 cursor-pointer items-center",
              "glass-surface glass-surface-hover rounded-xl border border-white/10 shadow-glass"
            )}
            onClick={toggleExpand}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {/* Executor Column */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-text-muted" />
              </motion.div>
              <div className="w-10 h-10 rounded-lg bg-[rgba(30,35,41,0.65)] border border-white/10 backdrop-blur-lg flex items-center justify-center text-2xl shadow-inner">
                {executor.name[0]}
              </div>
              <div>
                <div className="font-semibold text-text-primary">
                  {executor.name}
                </div>
                <div className="text-sm text-text-muted line-clamp-1">
                  {executor.description}
                </div>
              </div>
            </div>

            {/* sUNC Column */}
            <div>
              <SuncBadge rating={executor.suncRating} size="sm" showLabel={false} />
            </div>

            {/* Status Column */}
            <div>
              <StatusIndicator status={executor.status} compact />
            </div>

            {/* Platform Column */}
            <div className="flex gap-1 flex-wrap">
              {platforms.slice(0, 2).map((platform) => (
                <div
                  key={platform}
                  className="h-6 px-2 rounded-full bg-background-elevated text-[11px] text-text-secondary flex items-center capitalize"
                >
                  {platform}
                </div>
              ))}
              {platforms.length > 2 && (
                <div className="h-6 px-2 rounded-full bg-background-elevated text-[11px] text-text-muted flex items-center">
                  +{platforms.length - 2}
                </div>
              )}
            </div>

            {/* Category Column */}
            <div>
              <CategoryBadge category={executor.category} />
            </div>

            {/* Rating Column */}
            <div className="flex items-center gap-1">
              <span className="text-warning">★</span>
              <span className="font-medium text-text-primary text-sm">
                {executor.rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">
                ({executor.rating.count.toLocaleString()})
              </span>
            </div>

            {/* Price Column */}
            <div className="font-semibold text-text-primary">
              {formatPrice(executor.pricing.price, executor.pricing.currency)}
            </div>

            {/* Actions Column */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="primary" size="sm" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>
          </motion.div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-[rgba(21,26,33,0.85)] backdrop-blur-2xl shadow-glass"
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        About
                      </h3>
                      <p className="text-sm text-text-primary">
                        {executor.longDescription || executor.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        Key Features
                      </h3>
                      <ul className="space-y-1">
                        {executor.keyFeatures?.map((feature, i) => (
                          <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        All Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {executor.features.map((feature, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-background-elevated text-xs text-text-secondary"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        Status Details
                      </h3>
                      <StatusIndicator status={executor.status} compact={false} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        Roblox Version
                      </h3>
                      <p className="text-sm font-mono text-text-primary bg-background-elevated px-3 py-2 rounded-md">
                        {executor.status.robloxVersion}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        Last Updated
                      </h3>
                      <p className="text-sm text-text-primary">
                        {formatRelativeTime(executor.status.lastChecked)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(executor.status.lastChecked).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-secondary mb-2">
                        Platform Support
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map((platform) => (
                          <div
                            key={platform}
                            className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary capitalize"
                          >
                            {platform}
                          </div>
                        ))}
                      </div>
                    </div>

                    {executor.links && (
                      <div>
                        <h3 className="text-sm font-semibold text-text-secondary mb-2">
                          Links
                        </h3>
                        <div className="space-y-2">
                          {executor.links.website && (
                            <a
                              href={executor.links.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline block"
                            >
                              Website →
                            </a>
                          )}
                          {executor.links.discord && (
                            <a
                              href={executor.links.discord}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline block"
                            >
                              Discord →
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
}
