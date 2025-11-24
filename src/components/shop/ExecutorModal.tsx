"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Globe, Download } from "lucide-react";
import type { Executor } from "@/types/executor";

interface ExecutorModalProps {
  executor: Executor | null;
  onClose: () => void;
}

export function ExecutorModal({ executor, onClose }: ExecutorModalProps) {
  if (!executor) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          layoutId={`card-${executor.id}`}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#151A21] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image / Gradient */}
          <div className="h-32 bg-gradient-to-b from-primary/20 to-transparent" />

          {/* Content Container */}
          <div className="relative -mt-12 px-6 pb-6">
            {/* Top Row: sUNC (Left) & Close (Right) */}
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md">
                <span className="font-bold text-primary">{executor.suncRating}% sUNC</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-black/20 p-1 transition hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Centered Logo */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-white/5 bg-[#1E2329] p-1 shadow-xl">
                <span className="text-4xl font-bold">{executor.name[0]}</span>
              </div>
            </div>

            {/* Title & Status */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-white">{executor.name}</h2>
              <div className="flex justify-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      executor.status.working ? "bg-success" : "bg-danger"
                    }`}
                  />
                  {executor.status.working ? "Working" : "Not Working"}
                </span>
                <span>•</span>
                <span>Updated {new Date(executor.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-center text-sm leading-relaxed text-text-secondary">
              {executor.description}
            </p>

            {/* Feature Grid */}
            {executor.features && executor.features.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-3">
                {executor.features.slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-text-primary">
                    <Check size={14} className="text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {/* Platform Badges */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {Object.entries(executor.platforms)
                .filter(([, supported]) => supported)
                .map(([platform]) => (
                  <span
                    key={platform}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize text-text-secondary backdrop-blur-sm"
                  >
                    {platform}
                  </span>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
              {executor.pricing.purchaseUrl && (
                <a
                  href={executor.pricing.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  {executor.pricing.type === "free" ? (
                    <>
                      <Download size={16} /> Download Now
                    </>
                  ) : (
                    <>
                      <Globe size={16} /> Buy Now
                    </>
                  )}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
