"use client";

import { motion } from "framer-motion";
import type { Executor } from "@/types/executor";

interface ExecutorCardProps {
  executor: Executor;
  onClick?: () => void;
}

export function ExecutorCard({ executor, onClick }: ExecutorCardProps) {
  return (
    <motion.div
      layoutId={`card-${executor.id}`}
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/10"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Pulsing Status Dot (Top Right) */}
      <div
        className={`absolute right-3 top-3 h-2 w-2 rounded-full ${
          executor.status.working ? "bg-success" : "bg-danger"
        } animate-pulse`}
      />

      {/* Large Centered Logo */}
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-background-elevated p-2 shadow-lg">
        <span className="text-2xl font-bold text-text-primary">{executor.name[0]}</span>
      </div>

      {/* Title */}
      <h3 className="text-center text-lg font-bold text-text-primary">{executor.name}</h3>

      {/* Price Badge (Bottom Right) */}
      <div className="absolute bottom-3 right-3 rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-text-secondary">
        {executor.pricing.type === "free"
          ? "Free"
          : executor.pricing.rawCostString || `$${executor.pricing.price}`}
      </div>
    </motion.div>
  );
}
