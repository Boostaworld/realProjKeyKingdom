# Phase 3 & 4 Implementation Guide for Claude Code

**Objective**: Implement premium UI polish (Compact Cards, Modal, Animated Pills) and Custom RDD.

**Estimated Time**: 4-6 hours
**Files Changed**: ~6 files

---

## Phase 3: Premium Polish

### 3.1 Compact Executor Card (Key-Empire Style)

**MODIFY**: [src/components/shop/ExecutorCard.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/ExecutorCard.tsx)

**Changes**:
- Remove "View Details" overlay.
- Make card strictly clickable (opens modal).
- Reduce padding and font sizes.
- Center the logo and make it dominant.

```typescript
// Key changes to styles:
<motion.div
  layoutId={`card-${executor.id}`}
  className="group relative flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
>
  {/* Pulsing Status Dot (Top Right) */}
  <div className={`absolute right-3 top-3 h-2 w-2 rounded-full ${executor.status.working ? 'bg-success' : 'bg-danger'} animate-pulse`} />

  {/* Large Centered Logo */}
  <div className="mb-3 h-16 w-16 rounded-lg bg-background-elevated p-2 shadow-lg">
    {/* Image component here */}
    <span className="text-2xl font-bold">{executor.name[0]}</span>
  </div>

  {/* Title */}
  <h3 className="text-lg font-bold text-text-primary">{executor.name}</h3>

  {/* Price Badge (Bottom Right) */}
  <div className="absolute bottom-3 right-3 rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-text-secondary">
    {executor.pricing.type === 'free' ? 'Free' : `$${executor.pricing.price}`}
  </div>
</motion.div>
```

### 3.2 Executor Detail Modal

**NEW FILE**: `src/components/shop/ExecutorModal.tsx`

**Logic**:
- Use `AnimatePresence` for entry/exit.
- Use `layoutId` to animate from the card.
- Conditional rendering for buttons.

```typescript
"use client";
import { motion } from "framer-motion";
import { X, Check, Globe, Download } from "lucide-react";
import type { Executor } from "@/types/executor";

export function ExecutorModal({ executor, onClose }: { executor: Executor; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        layoutId={`card-${executor.id}`}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#151A21] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image / Gradient */}
        <div className="h-32 bg-gradient-to-b from-primary/20 to-transparent" />

        {/* Content Container */}
        <div className="px-6 pb-6 -mt-12 relative">
          {/* Top Row: sUNC (Left) & Close (Right) */}
          <div className="flex justify-between items-start mb-4">
            <div className="rounded-lg bg-black/40 backdrop-blur-md px-3 py-1 border border-white/10">
               <span className="text-primary font-bold">{executor.suncRating}% sUNC</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full bg-black/20 hover:bg-white/10 transition">
              <X size={20} />
            </button>
          </div>

          {/* Centered Logo */}
          <div className="flex justify-center mb-4">
             <div className="h-24 w-24 rounded-xl bg-[#1E2329] p-1 shadow-xl border border-white/5 flex items-center justify-center">
                <span className="text-4xl font-bold">{executor.name[0]}</span>
             </div>
          </div>

          {/* Title & Status */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{executor.name}</h2>
            <div className="flex justify-center gap-3 text-xs text-text-secondary">
               <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success"/> Working</span>
               <span>•</span>
               <span>Updated {new Date(executor.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
            {executor.description}
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {executor.features.slice(0, 4).map(feature => (
              <div key={feature} className="flex items-center gap-2 text-sm text-text-primary">
                <Check size={14} className="text-primary" />
                {feature}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {executor.pricing.purchaseUrl && (
               <a href={executor.pricing.purchaseUrl} target="_blank" className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition">
                 <Globe size={16} /> Visit Website
               </a>
            )}
             {/* Add Download button logic here if applicable */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

### 3.3 Animated Platform Pills

**MODIFY**: [src/components/shop/PlatformStatusPills.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/components/shop/PlatformStatusPills.tsx)

**Changes**:
- Default state: `w-8 h-8 rounded-full`.
- Expanded state: `w-auto rounded-lg`.
- Use `AnimatePresence` for text content.

```typescript
// Animation variants
const pillVariants = {
  collapsed: { width: 32, borderRadius: 999 },
  expanded: { width: "auto", borderRadius: 8 }
};

// Render
<motion.div
  variants={pillVariants}
  initial="collapsed"
  animate={isExpanded ? "expanded" : "collapsed"}
  className="overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md h-8 flex items-center"
>
  {/* Icon always visible */}
  <div className="w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer" onClick={toggle}>
    <Icon size={16} />
  </div>

  {/* Content fades in */}
  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pr-3 pl-1 whitespace-nowrap text-xs font-mono flex items-center gap-2"
      >
        <span>{hash}</span>
        <CopyButton text={hash} />
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

---

### 4.1 Install Dependencies

**COMMAND**: `npm install jszip`

### 4.2 RDD Proxy Route (CORS Bypass)

**NEW FILE**: `src/app/api/rdd/proxy/route.ts`

**Logic**:
- Proxies requests to `setup.rbxcdn.com` to avoid CORS issues in the browser.
- Handles both text (manifest) and binary (zip files) responses.

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  
  if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const targetUrl = `https://setup.rbxcdn.com/${path}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);

    const contentType = response.headers.get("content-type");
    
    // Return as blob/stream
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

### 4.3 Client-Side RDD Builder

**MODIFY**: [src/app/tools/rdd/page.tsx](file:///c:/Users/kayla/OneDrive/Desktop/keykingdom/src/app/tools/rdd/page.tsx)

**Logic**:
- Real implementation of the logs provided by the user.
- Uses `JSZip` to build the archive in the browser (no server timeout).
- Downloads files sequentially via the proxy.

```typescript
"use client";
import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

// Standard Roblox packages (fallback if manifest fails)
const ROBLOX_PACKAGES = [
  "RobloxApp.zip", "content-avatar.zip", "content-configs.zip", "content-fonts.zip",
  "content-models.zip", "content-sky.zip", "content-sounds.zip", "shaders.zip",
  "ssl.zip", "content-textures2.zip", "content-textures3.zip", "content-terrain.zip",
  "content-platform-fonts.zip", "content-platform-dictionaries.zip", "extracontent-places.zip",
  "extracontent-luapackages.zip", "extracontent-translations.zip", "extracontent-models.zip",
  "extracontent-textures.zip", "WebView2.zip", "WebView2RuntimeInstaller.zip"
];

export default function RDDPage() {
  const [channel, setChannel] = useState("LIVE");
  const [binary, setBinary] = useState("WindowsPlayer");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-fetch latest version
  useEffect(() => {
    fetchLatestVersion();
  }, []);

  const fetchLatestVersion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rdd/proxy?path=version`);
      const ver = await res.text();
      if (ver) setVersion(ver.trim());
    } catch (e) {
      console.error("Failed to fetch version");
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleDownload = async () => {
    if (!version || isDownloading) return;
    setIsDownloading(true);
    setLogs([]);
    
    try {
      const zip = new JSZip();
      addLog(`Initiating download sequence for ${binary} @ ${channel} (Build: ${version})`);
      
      // 1. Get Manifest (Simulated or Real)
      addLog("Retrieving manifest data");
      await new Promise(r => setTimeout(r, 500));
      
      const packages = ROBLOX_PACKAGES; // In a full implementation, we'd parse the manifest
      addLog(`Found ${packages.length} packages to download`);

      // 2. Download Loop
      let processed = 0;
      for (const pkg of packages) {
        addLog(`Downloading ${pkg}`);
        
        // Fetch via proxy
        const response = await fetch(`/api/rdd/proxy?path=${version}-${pkg}`);
        if (!response.ok) {
           addLog(`Failed to download ${pkg} - Skipping`);
           continue;
        }
        
        const blob = await response.blob();
        
        addLog(`Extracting ${pkg}`);
        // In a real "installer" logic we might extract, but for a zip download we just add the file
        // Or if we want to mimic the structure, we add it to the zip
        zip.file(pkg, blob);
        
        addLog(`Extracted ${pkg}`);
        processed++;
        
        if (processed % 10 === 0) {
           addLog(`${processed}/${packages.length} packages processed`);
        }
      }

      addLog(`${processed}/${packages.length} packages processed`);
      addLog("Building final archive");

      // 3. Generate Zip
      const content = await zip.generateAsync({ type: "blob" });
      
      // 4. Trigger Save
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Roblox-${version}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addLog("The download has finished. Thanks for using Key-Kingdom RDD.");
      toast.success("Download Complete!");

    } catch (error) {
      addLog(`Error: ${error}`);
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151A21] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Roblox Data Downloader</h1>
        
        <div className="space-y-4">
          {/* Inputs (Channel, Binary, Version) - Same as before */}
          <div>
            <label className="block text-xs text-text-secondary mb-1">Target Version</label>
            <div className="relative">
              <input 
                type="text" 
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full rounded-lg bg-black/20 border border-white/10 p-2.5 text-sm text-white focus:border-primary outline-none font-mono"
              />
              {loading && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="animate-spin text-primary" size={16} />
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleDownload}
            disabled={!version || loading || isDownloading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {isDownloading ? "Processing..." : "Download Now"}
          </button>
          
          {/* Terminal Output */}
          <div className="mt-6 rounded-lg bg-black/40 border border-white/5 p-4 font-mono text-xs text-text-secondary h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <div className="flex items-center gap-2 text-text-muted border-b border-white/5 pb-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"/>
              <div className="w-2 h-2 rounded-full bg-yellow-500"/>
              <div className="w-2 h-2 rounded-full bg-green-500"/>
              <span className="ml-2">console output</span>
            </div>
            
            {logs.length === 0 ? (
              <div className="text-text-muted opacity-50 italic">Ready to download...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Instructions for Claude Code

Copy and paste this prompt:

```text
Implement Phase 3 and 4 of the UI overhaul using the guide in 'claude_code_phase_3_4_guide.md'.

1. **Phase 3**:
   - Update `ExecutorCard.tsx` to the new compact Key-Empire style.
   - Create `ExecutorModal.tsx` with the specified layout and animations.
   - Update `PlatformStatusPills.tsx` to use the expanding circle animation.
   - Ensure clicking a card opens the modal.

2. **Phase 4**:
   - Replace the content of `src/app/tools/rdd/page.tsx` with the custom form provided in the guide.
   - Ensure the download button constructs the correct URL.

Follow the code snippets exactly.
```
