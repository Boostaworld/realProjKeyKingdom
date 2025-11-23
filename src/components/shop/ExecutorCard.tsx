"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SuncBadge } from "@/components/shared/SuncBadge";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatPrice, formatRelativeTime } from "@/lib/utils/formatters";
import { useAppStore } from "@/lib/store/appStore";
import type { Executor } from "@/types/executor";

interface ExecutorCardProps {
  executor: Executor;
  index: number;
}

export function ExecutorCard({ executor, index }: ExecutorCardProps) {
  const { expandedRow, setExpandedRow } = useAppStore();
  const isExpanded = expandedRow === executor.id;

  const toggleExpand = () => {
    setExpandedRow(isExpanded ? null : executor.id);
  };

  const handleBuyNow = () => {
    if (!executor.pricing.purchaseUrl) return;
    window.open(executor.pricing.purchaseUrl, "_blank", "noopener,noreferrer");
  };

  const platforms = Object.entries(executor.platforms)
    .filter(([, supported]) => supported)
    .map(([platform]) => platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -6, scale: 1.01, boxShadow: "0 14px 32px rgba(88, 101, 242, 0.25)" }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(21,26,33,0.9)] to-[rgba(30,35,41,0.95)] backdrop-blur-2xl shadow-glass transition-all duration-300"
    >
      {/* Card Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-[rgba(30,35,41,0.7)] border border-white/10 backdrop-blur-xl flex items-center justify-center text-2xl shrink-0 shadow-inner shadow-glass">
              {executor.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary">
                {executor.name}
              </h3>
              <p className="text-sm text-text-muted line-clamp-2">
                {executor.description}
              </p>
            </div>
          </div>
          <SuncBadge rating={executor.suncRating} size="sm" showLabel={false} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-text-muted text-xs mb-1">Status</div>
            <StatusIndicator status={executor.status} compact />
          </div>
          <div>
            <div className="text-text-muted text-xs mb-1">Rating</div>
            <div className="flex items-center gap-1">
              <span className="text-warning">★</span>
              <span className="font-medium text-text-primary">
                {executor.rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">
                ({executor.rating.count})
              </span>
            </div>
          </div>
        </div>

        {/* Platform & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          {platforms.map((platform) => (
            <div
              key={platform}
              className="h-6 px-2 rounded-full bg-white/5 border border-white/10 text-[11px] text-text-secondary flex items-center capitalize backdrop-blur-md shadow-inner"
            >
              {platform}
            </div>
          ))}
          <CategoryBadge category={executor.category} />
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="font-semibold text-lg text-text-primary">
            {formatPrice(executor.pricing.price)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button variant="primary" size="sm" onClick={handleBuyNow}>
              Buy
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-[rgba(21,26,33,0.85)] backdrop-blur-2xl"
          >
            <div className="p-4 space-y-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
