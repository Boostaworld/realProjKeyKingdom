"use client";

import { motion } from "framer-motion";
import { ExecutorList } from "@/components/shop/ExecutorList";
import { PlatformStatusPills } from "@/components/shop/PlatformStatusPills";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-DEFAULT">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-text-primary mb-3">
            Key-Kingdom
          </h1>
          <p className="text-xl text-text-secondary">
            Browse and purchase Roblox executors safely • Sorted by sUNC safety rating
          </p>
        </motion.div>

        {/* Platform Status Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="glass-card p-4 shadow-glass">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">
              Platform Status
            </h2>
            <PlatformStatusPills />
          </div>
        </motion.div>

        {/* Executor List (Table on Desktop, Cards on Mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ExecutorList />
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-text-muted">
            ✨ Click any executor to expand and view detailed information
          </p>
          <p className="text-xs text-text-muted mt-1">
            Updated in real-time via WEAO API
          </p>
        </motion.div>
      </div>
    </div>
  );
}
