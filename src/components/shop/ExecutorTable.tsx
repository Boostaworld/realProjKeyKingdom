"use client";

import { motion } from "framer-motion";
import type { Executor } from "@/types/executor";
import { ExecutorRow } from "./ExecutorRow";

interface ExecutorTableProps {
  executors: Executor[];
}

export function ExecutorTable({ executors }: ExecutorTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-white/10 bg-background-tertiary/60 backdrop-blur-md shadow-glass"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-background-secondary/40 text-sm text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">Executor</th>
              <th className="px-4 py-3 text-center font-semibold">sUNC</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Platforms</th>
              <th className="px-4 py-3 text-center font-semibold">Rating</th>
              <th className="px-4 py-3 text-center font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {executors.map((executor) => (
              <ExecutorRow key={executor.id} executor={executor} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
