"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SuncBadge } from "@/components/shared/SuncBadge";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatPrice } from "@/lib/utils/formatters";
import type { Executor } from "@/types/executor";

interface ExecutorRowProps {
  executor: Executor;
  index: number;
}

export function ExecutorRow({ executor }: ExecutorRowProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/executor/${executor.slug}`);
  };

  const handleBuyNow = () => {
    if (!executor.pricing.purchaseUrl) return;
    window.open(executor.pricing.purchaseUrl, "_blank", "noopener,noreferrer");
  };

  const platforms = Object.entries(executor.platforms)
    .filter(([, supported]) => supported)
    .map(([platform]) => platform);

  return (
    <tr
      className="border-b border-background-elevated hover:bg-background-elevated/40 cursor-pointer transition-colors"
      onClick={handleViewDetails}
    >
      {/* Executor Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-background-elevated flex items-center justify-center text-2xl">
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
      </td>

      {/* sUNC Column */}
      <td className="px-4 py-3">
        <SuncBadge rating={executor.suncRating} size="sm" showLabel={false} />
      </td>

      {/* Status Column */}
      <td className="px-4 py-3">
        <StatusIndicator status={executor.status} compact />
      </td>

      {/* Platform Column */}
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {platforms.map((platform) => (
            <div
              key={platform}
              className="h-6 px-2 rounded-full bg-background-elevated text-[11px] text-text-secondary flex items-center capitalize"
            >
              {platform}
            </div>
          ))}
        </div>
      </td>

      {/* Category Column */}
      <td className="px-4 py-3">
        <CategoryBadge category={executor.category} />
      </td>

      {/* Rating Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-warning">★</span>
          <span className="font-medium text-text-primary">
            {executor.rating.average.toFixed(1)}
          </span>
          <span className="text-xs text-text-muted">
            ({executor.rating.count.toLocaleString()})
          </span>
        </div>
      </td>

      {/* Price Column */}
      <td className="px-4 py-3">
        <div className="font-semibold text-text-primary">
          {formatPrice(executor.pricing.price, executor.pricing.currency)}
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-3">
        <div
          className="flex items-center gap-2 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="sm" onClick={handleViewDetails}>
            View
          </Button>
          <Button variant="primary" size="sm" onClick={handleBuyNow}>
            Buy
          </Button>
        </div>
      </td>
    </tr>
  );
}
