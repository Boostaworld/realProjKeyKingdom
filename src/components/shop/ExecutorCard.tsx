"use client";

import { motion } from "framer-motion";
import type { Executor } from "@/types/executor";

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

// Platform Icon Components with proper brand colors
const WindowsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 2.5L6.5 1.5V7.75H0V2.5Z" fill="#00A4EF" />
    <path d="M7.25 1.4375L15.5 0V7.75H7.25V1.4375Z" fill="#00A4EF" />
    <path d="M0 8.5H6.5V14.75L0 13.75V8.5Z" fill="#00A4EF" />
    <path d="M7.25 8.5H15.5V16L7.25 14.8125V8.5Z" fill="#00A4EF" />
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.182 2.5c.086 1.245-.337 2.458-1.13 3.375-.793.918-1.99 1.625-3.302 1.563-.119-1.213.391-2.458 1.152-3.313.761-.855 2.043-1.531 3.28-1.625zm.693 2.188c-1.825-.107-3.38.938-4.245.938-.865 0-2.198-.891-3.61-.866-1.858.025-3.573 1.08-4.524 2.745-1.931 3.35-.494 8.313 1.388 11.032.92 1.332 2.017 2.828 3.46 2.774 1.388-.055 1.912-.893 3.59-.893 1.677 0 2.145.893 3.609.865 1.49-.027 2.456-1.36 3.376-2.692 1.065-1.542 1.505-3.036 1.532-3.114-.033-.017-2.94-1.132-2.973-4.488-.03-2.803 2.29-4.148 2.395-4.217-1.306-1.913-3.342-2.127-4.058-2.187z" fill="url(#apple-gradient)" fillOpacity="0.9" />
    <defs>
      <linearGradient id="apple-gradient" x1="8" y1="0" x2="8" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A3AAAE" />
        <stop offset="1" stopColor="#5C6670" />
      </linearGradient>
    </defs>
  </svg>
);

const MobileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="1" width="8" height="14" rx="1.5" stroke="url(#mobile-gradient)" strokeWidth="1.5" fill="none" />
    <circle cx="8" cy="12.5" r="0.75" fill="url(#mobile-gradient)" />
    <line x1="5.5" y1="3" x2="10.5" y2="3" stroke="url(#mobile-gradient)" strokeWidth="0.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="mobile-gradient" x1="8" y1="1" x2="8" y2="15" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
);

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
      className="group relative grid grid-cols-[130px_1fr] h-[130px] rounded-2xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #1a1f2e 0%, #151a21 100%)",
        boxShadow: "0 0 0 1px rgba(139, 92, 246, 0), 0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.15), 0 12px 40px rgba(0, 0, 0, 0.5)",
      }}
      transition={{ duration: 0.2 }}
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
            className={`w-2.5 h-2.5 rounded-full ${executor.status.working ? "bg-success" : "bg-danger"
              }`}
            style={{
              boxShadow: executor.status.working
                ? "0 0 8px rgba(67, 181, 129, 0.8)"
                : "0 0 8px rgba(237, 66, 69, 0.8)",
            }}
          />
        </div>
      </div>

      {/* RIGHT: Info Section */}
      <div className="flex flex-col p-5 gap-2.5">
        {/* Header Row: Name + sUNC */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-bold text-white leading-tight">
            {executor.name}
          </h3>
          <div
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border border-[#5865f2]/30"
            style={{
              background: "rgba(88, 101, 242, 0.2)",
              color: "#8b9cff",
              boxShadow: "0 0 20px rgba(88, 101, 242, 0.4), inset 0 0 20px rgba(88, 101, 242, 0.1)",
            }}
          >
            {executor.suncRating}% sUNC
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {executor.description}
        </p>

        {/* Bottom Row: Platforms + Price */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {platformIcons.windows && (
              <div
                className="w-8 h-8 rounded-lg bg-[#00A4EF]/10 border border-[#00A4EF]/30 flex items-center justify-center transition-all duration-200 hover:bg-[#00A4EF]/20"
                style={{
                  boxShadow: "0 0 12px rgba(0, 164, 239, 0.3)",
                }}
              >
                <WindowsIcon />
              </div>
            )}
            {platformIcons.mac && (
              <div
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                style={{
                  boxShadow: "0 0 12px rgba(163, 170, 174, 0.2)",
                }}
              >
                <AppleIcon />
              </div>
            )}
            {platformIcons.mobile && (
              <div
                className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:bg-emerald-500/20"
                style={{
                  boxShadow: "0 0 12px rgba(52, 211, 153, 0.3)",
                }}
              >
                <MobileIcon />
              </div>
            )}
          </div>

          <span
            className="text-base font-bold"
            style={{
              color: executor.pricing.type === "free" ? "#43b581" : "#faa61a",
              textShadow: executor.pricing.type === "free"
                ? "0 0 10px rgba(67, 181, 129, 0.5)"
                : "0 0 10px rgba(250, 166, 26, 0.5)",
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
