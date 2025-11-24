"use client";

import { motion } from "framer-motion";
import type { Executor } from "@/types/executor";
import { ExecutorCard } from "./ExecutorCard";

interface ExecutorGridProps {
  executors: Executor[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ExecutorGrid({ executors }: ExecutorGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {executors.map((executor) => (
        <motion.div key={executor.id} variants={item}>
          <ExecutorCard executor={executor} />
        </motion.div>
      ))}
    </motion.div>
  );
}
