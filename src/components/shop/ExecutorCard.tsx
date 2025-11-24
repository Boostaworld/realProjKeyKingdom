"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Executor } from "@/types/executor";
import { SuncBadge } from "@/components/shared/SuncBadge";
import { formatPrice } from "@/lib/utils/formatters";

interface ExecutorCardProps {
  executor: Executor;
}

export function ExecutorCard({ executor }: ExecutorCardProps) {
  const platforms = Object.entries(executor.platforms)
    .filter(([, supported]) => supported)
    .map(([platform]) => platform);

  return (
    <Link href={`/executors/${executor.slug}`}>
      <motion.div
        className="group relative h-full rounded-2xl border border-white/10 bg-background-surface p-6 transition-all hover:border-primary/50 hover:shadow-glass-hover"
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Status Indicator */}
        <div className="absolute right-4 top-4">
          <div
            className={`h-2.5 w-2.5 rounded-full animate-pulse ${
              executor.status.working ? "bg-success" : "bg-danger"
            }`}
          />
        </div>

        {/* Logo/Icon */}
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-background-elevated text-3xl font-bold text-text-primary">
          {executor.name[0]}
        </div>

        {/* Name */}
        <h3 className="mb-2 text-xl font-semibold text-text-primary group-hover:text-primary transition">
          {executor.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
          {executor.description}
        </p>

        {/* sUNC Badge - Prominent */}
        <div className="mb-4 flex justify-center">
          <SuncBadge rating={executor.suncRating} size="lg" showGlow />
        </div>

        {/* Platforms */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="rounded-md bg-background-elevated px-2 py-1 text-xs capitalize text-text-secondary"
            >
              {platform}
            </span>
          ))}
        </div>

        {/* Bottom: Rating + Price */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 text-warning" />
            <span className="text-text-primary">{executor.rating.average.toFixed(1)}</span>
            <span className="text-text-muted">({executor.rating.count})</span>
          </div>

          <span className="font-semibold text-text-primary">
            {executor.pricing.rawCostString ||
              formatPrice(executor.pricing.price, executor.pricing.currency)}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-end justify-center rounded-2xl bg-gradient-to-t from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 p-6">
          <span className="text-sm font-semibold text-primary">
            View Details →
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
