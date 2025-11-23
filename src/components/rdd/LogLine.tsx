"use client";

import { motion } from 'framer-motion';
import { RDDLog } from '@/lib/rdd/useRDD';

interface LogLineProps {
  log: RDDLog;
}

export function LogLine({ log }: LogLineProps) {
  const getColor = () => {
    switch (log.type) {
      case 'success':
        return 'text-[#43B581]'; // Green
      case 'progress':
        return 'text-[#00E5FF]'; // Cyan
      case 'error':
        return 'text-[#F04747]'; // Red
      default:
        return 'text-gray-400'; // Gray for info
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`${getColor()} leading-relaxed flex items-start gap-2 py-1`}
    >
      <span className="flex-1 font-mono text-sm">{log.message}</span>
      <span className="flex-shrink-0 text-xs text-gray-500">
        {log.timestamp.toLocaleTimeString()}
      </span>
    </motion.div>
  );
}
