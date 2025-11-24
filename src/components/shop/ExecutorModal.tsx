"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Monitor, Apple, Smartphone, Globe, Download } from "lucide-react";
import type { Executor } from "@/types/executor";

interface ExecutorModalProps {
  executor: Executor;
  onClose: () => void;
}

const LOGO_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

export function ExecutorModal({ executor, onClose }: ExecutorModalProps) {
  const gradientIndex = executor.id.charCodeAt(0) % LOGO_GRADIENTS.length;
  const logoGradient = LOGO_GRADIENTS[gradientIndex];

  const platformIcons = {
    windows: executor.platforms.windows,
    mac: executor.platforms.mac,
    mobile: executor.platforms.mobile,
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        style={{ paddingTop: "10vh" }}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[550px] rounded-2xl border border-white/10 p-8"
          style={{
            background: "linear-gradient(135deg, #1a1f2e 0%, #151a21 100%)",
          }}
        >
          {/* Header: Title + sUNC + Close */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-white">{executor.name}</h2>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  background: "rgba(88, 101, 242, 0.15)",
                  borderColor: "rgba(88, 101, 242, 0.3)",
                  color: "#5865f2",
                }}
              >
                {executor.suncRating}% sUNC
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Logo */}
          <div
            className="w-28 h-28 mx-auto mb-5 rounded-2xl flex items-center justify-center text-5xl font-bold text-white"
            style={{ background: logoGradient }}
          >
            {executor.name[0]}
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary text-center leading-relaxed mb-6">
            {executor.longDescription || executor.description}
          </p>

          {/* Key Features */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Key Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {(executor.keyFeatures || executor.features.slice(0, 4)).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text-primary">
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="flex justify-center gap-3 mb-5">
            {platformIcons.windows && (
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-text-secondary" />
                <span className="text-xs text-text-primary">Windows</span>
              </div>
            )}
            {platformIcons.mac && (
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Apple className="w-4 h-4 text-text-secondary" />
                <span className="text-xs text-text-primary">Mac</span>
              </div>
            )}
            {platformIcons.mobile && (
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-text-secondary" />
                <span className="text-xs text-text-primary">Mobile</span>
              </div>
            )}
          </div>

          {/* Status Row */}
          <div className="text-center text-sm text-text-secondary mb-6">
            <span className={executor.status.working ? "text-success" : "text-danger"}>
              {executor.status.working ? "Working" : "Not Working"}
            </span>
            {" • "}
            <span>Updated {new Date(executor.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {executor.pricing.type === "free" ? (
              <>
                <button className="px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition">
                  <Download className="w-4 h-4" />
                  Download Now
                </button>
                {executor.links?.website && (
                  <a
                    href={executor.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </>
            ) : (
              <>
                <a
                  href={executor.pricing.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition"
                >
                  Buy Now
                </a>
                {executor.links?.website && (
                  <a
                    href={executor.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
