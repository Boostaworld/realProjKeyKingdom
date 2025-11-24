# ExecutorCard & Modal Redesign - EXACT Implementation

**CRITICAL**: These mockups are APPROVED. Implement EXACTLY as shown. Do NOT improvise.

---

## Visual Reference (APPROVED DESIGN)

### ExecutorCard Target Design
![ExecutorCard Mockup](C:/Users/kayla/.gemini/antigravity/brain/1a4a7fee-b5e3-4165-90b7-02c77f8a2080/executor_card_mockup_1763945997107.png)

### ExecutorModal Target Design
![ExecutorModal Mockup](C:/Users/kayla/.gemini/antigravity/brain/1a4a7fee-b5e3-4165-90b7-02c77f8a2080/executor_modal_mockup_1763946013838.png)

---

## Implementation Rules

⚠️ **DO NOT DEVIATE FROM THESE SPECS**:
1. Use the EXACT color values provided
2. Use the EXACT spacing/padding values
3. Follow the EXACT layout structure
4. Match the visual hierarchy shown in mockups
5. If something is not specified, ask - do NOT guess

---

## ExecutorCard.tsx (COMPLETE REPLACEMENT)

**MODIFY**: [src/components/shop/ExecutorCard.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorCard.tsx)

```typescript
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
```

---

## ExecutorModal.tsx (COMPLETE REPLACEMENT)

**MODIFY**: [src/components/shop/ExecutorModal.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorModal.tsx)

```typescript
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
```

---

## Instructions for Claude Code

```
Replace ExecutorCard.tsx and ExecutorModal.tsx with the EXACT code provided above.

CRITICAL RULES:
1. Do NOT modify colors, spacing, or layout
2. Do NOT add extra features not shown in mockups
3. Do NOT change the gradient colors or logo styling
4. Use the EXACT pixel values specified (120px height, 180px logo width, etc.)
5. If icons are missing, install lucide-react: npm install lucide-react

After implementing, verify:
- Cards are horizontal (logo left, info right)
- Modal has sUNC badge inline with title
- Logo is centered under title in modal
- All spacing matches mockups
```
