"use client";

import { motion } from "framer-motion";
import { useExecutors } from "@/lib/hooks/useExecutors";
import { ExecutorRow } from "./ExecutorRow";

export function ExecutorTable() {
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
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[rgba(21,26,33,0.85)] backdrop-blur-2xl shadow-glass">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary" colSpan={8}>
              <div className="grid grid-cols-[1fr,80px,150px,120px,120px,100px,100px,140px] gap-4 items-center">
                <div>Executor</div>
                <div>
                  sUNC
                  <span className="ml-1 text-[10px] uppercase text-text-muted">
                    (sorted)
                  </span>
                </div>
                <div>Status</div>
                <div>Platform</div>
                <div>Category</div>
                <div>Rating</div>
                <div>Price</div>
                <div className="text-right">Actions</div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {executors.map((executor, index) => (
            <ExecutorRow key={executor.id} executor={executor} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
