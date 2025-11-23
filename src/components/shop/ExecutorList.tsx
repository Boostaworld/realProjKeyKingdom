"use client";

import { motion } from "framer-motion";
import { useExecutors } from "@/lib/hooks/useExecutors";
import { ExecutorTable } from "./ExecutorTable";
import { ExecutorCard } from "./ExecutorCard";

export function ExecutorList() {
  const { data: executors, isLoading, isError } = useExecutors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isError || !executors) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="text-text-secondary mb-2">
          Failed to load executors.
        </div>
        <div className="text-text-muted text-sm">
          Please try again in a moment.
        </div>
      </motion.div>
    );
  }

  if (executors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="text-text-secondary mb-2">No executors found</div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block">
        <ExecutorTable />
      </div>

      {/* Mobile Card View (hidden on desktop) */}
      <div className="md:hidden space-y-4">
        {executors.map((executor, index) => (
          <ExecutorCard key={executor.id} executor={executor} index={index} />
        ))}
      </div>
    </>
  );
}
