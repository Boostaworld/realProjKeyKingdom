"use client";

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`relative w-full h-2 bg-background-elevated rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #5865F2 0%, #00E5FF 100%)',
          boxShadow: '0 0 12px rgba(88, 101, 242, 0.6), 0 0 24px rgba(0, 229, 255, 0.3)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
      />
    </div>
  );
}
