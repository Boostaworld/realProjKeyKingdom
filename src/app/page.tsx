"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExecutorGrid } from "@/components/shop/ExecutorGrid";
import { PlatformStatusPills } from "@/components/shop/PlatformStatusPills";
import { LoadingIntro } from "@/components/shared/LoadingIntro";
import { useExecutors } from "@/lib/hooks/useExecutors";

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const { data: executors, isLoading, isError } = useExecutors();

  const renderGrid = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
          />
        </div>
      );
    }

    if (isError || !executors) {
      return (
        <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-8 text-center text-text-secondary">
          Failed to load executors. Please try again in a moment.
        </div>
      );
    }

    if (executors.length === 0) {
      return (
        <div className="rounded-xl border border-white/10 bg-background-elevated/60 px-6 py-8 text-center text-text-secondary">
          No executors found.
        </div>
      );
    }

    return <ExecutorGrid executors={executors} />;
  };

  return (
    <>
      <LoadingIntro onComplete={() => setShowContent(true)} />

      {showContent && (
        <div className="min-h-screen bg-background-DEFAULT">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <h1 className="text-5xl font-bold text-text-primary mb-3">Key-Kingdom</h1>
              <p className="text-xl text-text-secondary">
                Executor marketplace • Sorted by sUNC safety rating
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mb-6"
            >
              <PlatformStatusPills />
            </motion.div>

            <div>
              <main className="w-full">{renderGrid()}</main>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
