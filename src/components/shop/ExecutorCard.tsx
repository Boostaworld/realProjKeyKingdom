"use client";

import { motion } from "framer-motion";
import type { Executor } from "@/types/executor";
import { Monitor, Apple, Smartphone } from "lucide-react";

interface ExecutorCardProps {
  executor: Executor;
  onClick: () => void;
}

// Logo gradients for executors without images
const LOGO_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

export function ExecutorCard({ executor, onClick }: ExecutorCardProps) {
  // Assign gradient based on executor ID
  const gradientIndex = executor.id.charCodeAt(0) % LOGO_GRADIENTS.length;
  const logoGradient = LOGO_GRADIENTS[gradientIndex];

  const platformIcons = {
    windows: executor.platforms.windows,
    mac: executor.platforms.mac,
    mobile: executor.platforms.mobile,
  };

  return (
    <motion.div
      onClick={onClick}
      className="group relative grid grid-cols-[180px_1fr] h-[120px] rounded-xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/50 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(135deg, #1a1f2e 0%, #151a21 100%)",
      }}
      whileHover={{ scale: 1.005 }}
    >
      {/* LEFT: Logo Area */}
      <div
        className="relative flex items-center justify-center text-5xl font-bold text-white"
        style={{ background: logoGradient }}
      >
        {executor.name[0]}

        {/* Status Dot */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-2 h-2 rounded-full ${
              executor.status.working ? "bg-success" : "bg-danger"
            } animate-pulse`}
          />
        </div>
      </div>

      {/* RIGHT: Info Section */}
      <div className="flex flex-col justify-between p-4">
        {/* Header Row: Name + sUNC */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-xl font-bold text-white leading-tight">
            {executor.name}
          </h3>
          <div
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border"
            style={{
              background: "rgba(88, 101, 242, 0.15)",
              borderColor: "rgba(88, 101, 242, 0.3)",
              color: "#5865f2",
            }}
          >
            {executor.suncRating}% sUNC
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-1 leading-tight">
          {executor.description}
        </p>

        {/* Bottom Row: Platforms + Price */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {platformIcons.windows && (
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 text-text-secondary" />
              </div>
            )}
            {platformIcons.mac && (
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Apple className="w-3.5 h-3.5 text-text-secondary" />
              </div>
            )}
            {platformIcons.mobile && (
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5 text-text-secondary" />
              </div>
            )}
          </div>

          <span
            className="text-sm font-semibold"
            style={{
              color: executor.pricing.type === "free" ? "#43b581" : "#faa61a",
            }}
          >
            {executor.pricing.type === "free"
              ? "Free"
              : executor.pricing.rawCostString || `$${executor.pricing.price}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
