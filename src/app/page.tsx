"use client";

import { motion } from "framer-motion";
import { ExecutorTable } from "@/components/shop/ExecutorTable";
import { PlatformStatusPills } from "@/components/shop/PlatformStatusPills";
import { useExecutors } from "@/lib/hooks/useExecutors";

function FilterSection() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-2">
          Categories
        </h3>
        <div className="space-y-2">
          {[
            "Reputable executors",
            "Suspicious executors",
            "Verified only",
          ].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-background-elevated/40 px-3 py-2 text-sm text-text-muted"
            >
              <span>{label}</span>
              <span className="text-[11px] text-text-secondary">View</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 pt-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">
          Commerce
        </h3>
        <div className="space-y-2 text-sm text-text-muted">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-background-elevated/40 px-3 py-2">
            <span>Free / Paid</span>
            <span className="text-[11px] text-text-secondary">All</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-background-elevated/40 px-3 py-2">
            <span>Offers & bundles</span>
            <span className="text-[11px] text-text-secondary">Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: executors, isLoading, isError } = useExecutors();

  const renderTable = () => {
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

    return <ExecutorTable executors={executors} />;
  };

  return (
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
          className="glass-card mb-6 p-4 shadow-glass"
        >
          <h2 className="text-sm font-semibold text-text-secondary mb-3">
            Platform Status
          </h2>
          <PlatformStatusPills />
        </motion.div>

        <div className="glass-card mb-6 p-4 shadow-glass text-sm text-text-muted">
          <p>
            Compact table layout with collapsible rows. Click any executor to
            expand details.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <div className="rounded-xl border border-white/10 bg-background-tertiary/60 p-4 backdrop-blur-md">
              <FilterSection />
            </div>
          </aside>

          <main className="flex-1">
            {renderTable()}
          </main>
        </div>
      </div>
    </div>
  );
}
