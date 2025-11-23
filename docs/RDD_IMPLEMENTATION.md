# RDD_IMPLEMENTATION.md

**Roblox Deployment Downloader Integration for Key-Kingdom**

---

## Implementation Status

✅ **COMPLETED & OPTIMIZED** - RDD now delegates to Latte's battle-tested implementation for maximum performance.

**Last Updated:** 2025-11-23 (Refactored to delegate all downloads to rdd.latte.to for optimal speed and reliability)

---

## Purpose

This document specifies the RDD (Roblox Deployment Downloader) implementation in Key-Kingdom, which matches the upstream rdd.latte.to behavior while maintaining Key-Kingdom's brand identity and design system.

**Related Documentation:**
- `docs/UI_DESIGN_SYSTEM.md` - Visual specifications for RDD components
- `docs/components/rdd-components.md` - Detailed component specs
- `docs/APP_SPEC.md` - Overall application structure
- `docs/WEAO_FALLBACK.md` - WEAO API integration and fallback mechanism

---

## Current Implementation Summary

### How It Works (New Delegated Architecture)

Key-Kingdom's RDD implementation now **delegates all downloads to rdd.latte.to** for optimal performance and reliability. Instead of doing client-side ZIP assembly ourselves, we:

1. **Provide a clean UI** for configuration
2. **Resolve versions automatically** (if requested) via WEAO or Roblox clientsettings API
3. **Build the correct URL** for Latte's RDD service
4. **Redirect the user** to rdd.latte.to with all parameters

### Why This Approach?

**Performance**: Latte's RDD is battle-tested and optimized. No more "1% per minute" slow assembly.

**Maintenance**: We don't need to maintain JSZip assembly code or handle edge cases - Latte's team does that.

**Reliability**: rdd.latte.to has been serving thousands of downloads for years with proven stability.

### Architecture Components

1. **Frontend Hook** (`src/lib/rdd/useRDD.ts`):
   - Manages download state and logs
   - Resolves version (if auto mode)
   - Builds Latte RDD URL via `buildRddUrl()`
   - Opens URL in new window
   - No JSZip, no client-side assembly!

2. **URL Builder** (`src/lib/rdd/buildRddUrl.ts`):
   - Constructs correct URL for rdd.latte.to
   - Handles parameters: `channel`, `binaryType`, `version`, `compressZip`, `compressionLevel`
   - Example: `https://rdd.latte.to/?channel=LIVE&binaryType=WindowsPlayer&version=version-abc123&compressZip=true&compressionLevel=5`

3. **Version Resolver** (`src/lib/rdd/resolveVersion.ts`):
   - Resolves latest version for auto mode
   - Tries WEAO first (via `/api/weao/versions/current`)
   - Falls back to Roblox clientsettings API (v2 → v1)
   - Handles 502 errors gracefully

4. **UI Components** (`src/components/rdd/*`):
   - `RDDConfig.tsx` - Configuration panel with:
     - Binary type dropdown (WindowsPlayer, WindowsStudio64, MacPlayer, MacStudio)
     - Channel selector (LIVE, Beta)
     - Version mode toggle (Latest vs Manual)
     - Compression toggle with level slider (1-9)
   - `VersionSelect.tsx` - Version mode selection
   - `RDDTerminal.tsx` - Terminal-style log output with copy/clear functions
   - Logs show version resolution and URL construction process

### Output Format

Latte's RDD service produces ZIP files with standard naming:

```
{binaryType}-{version}.zip
```

**Examples:**
- `WindowsPlayer-version-abc123def456.zip`
- `WindowsStudio64-version-abc123def456.zip`
- `MacPlayer-version-abc123def456.zip`

The download is handled entirely by rdd.latte.to in the new browser tab/window.

### Supported Platforms

| Platform      | Binary Type      | Blob Directory |
|---------------|------------------|----------------|
| Windows Player | WindowsPlayer    | `/`            |
| Windows Studio | WindowsStudio64  | `/`            |
| Mac Player    | MacPlayer        | `/mac/`        |
| Mac Studio    | MacStudio        | `/mac/`        |

### Version Resolution

**Version Resolution Flow:**
1. **Latest Version Mode** (versionMode: 'latest'):
   - Calls `resolveLatestVersion()` from `src/lib/rdd/resolveVersion.ts`
   - Tries WEAO first via `/api/weao/versions/current`
   - Falls back to Roblox clientsettings API (v2 → v1) if WEAO fails
   - Handles 502 errors gracefully - logs warning but doesn't break
   - Displays resolved version in terminal logs

2. **Manual Version Mode** (versionMode: 'manual'):
   - User provides exact version hash
   - Accepts with or without "version-" prefix
   - No API calls needed - uses version as-is
   - Skips resolution and goes straight to URL building

See `docs/WEAO_FALLBACK.md` for detailed fallback logic.

### Compression Control

**Compression Settings:**
- Toggle compression on/off
- Compression levels 1-9:
  - **1-3**: Fast compression, larger files (ideal for quick tests)
  - **4-6**: Balanced (default: 5)
  - **7-9**: Maximum compression, slower processing (ideal for distribution)
- Settings are passed to Latte's RDD via URL parameters
- Latte's RDD handles all compression logic - we just provide the UI

---

## Quick Reference

### What is RDD?
- **Open-source tool** (MIT license) for downloading Roblox client/studio binaries
- **Client-side only** - No backend required, runs entirely in browser
- **Uses JSZip** - Assembles packages from Roblox CDN in-browser
- **Official host**: https://rdd.latte.to
- **GitHub**: https://github.com/latte-soft/rdd

### Key-Kingdom's Implementation
**Matches and enhances inject.today/rdd:**
- ✅ Binary type dropdown (WindowsPlayer, WindowsStudio64, MacPlayer, MacStudio)
- ✅ Channel selector (LIVE, Beta)
- ✅ Version mode toggle (Latest with auto-resolution vs Manual input)
- ✅ **NEW**: Compression level control (1-9 slider)
- ✅ Real-time progress tracking with animated bar
- ✅ Terminal-style logging with copy/clear functions
- ✅ Dark glassmorphic UI matching Key-Kingdom design system
- ✅ Mobile-responsive layout

### Usage Instructions

**To download a Roblox binary:**

1. **Select Binary Type**: Choose from WindowsPlayer, WindowsStudio64, MacPlayer, or MacStudio
2. **Select Channel**: Choose LIVE (production) or Beta
3. **Choose Version Mode**:
   - **Latest Version**: Auto-resolves the current version from Roblox CDN
   - **Manual Version**: Enter a specific version hash (e.g., `version-e380c8edc8f6477c`)
4. **Configure Compression** (optional):
   - Toggle compression on/off
   - Adjust compression level (1=fastest, 9=best compression)
   - Default: Level 6 (balanced)
5. **Click Download**: Terminal will show real-time progress
6. **Wait for Completion**: ZIP file will download automatically

**Expected Output:**
- File name: `{channel}-{binaryType}-{version}.zip`
- Example: `LIVE-WindowsPlayer-version-e380c8edc8f6477c.zip`

---

## 1. RDD Technical Overview

### 1.1 How RDD Works

**Core Process:**
1. **Parse Parameters** - Read channel, binaryType, version from URL or form
2. **Fetch Manifest** - Download `rbxPkgManifest.txt` from Roblox CDN
3. **Download Packages** - Fetch each ZIP package listed in manifest
4. **Extract & Assemble** - Use JSZip to extract and reassemble into final ZIP
5. **Trigger Download** - Browser downloads the assembled deployment

**Key Technical Details:**
- **CDN**: `setup-aws.rbxcdn.com` (Roblox's official CDN)
- **Manifest**: `rbxPkgManifest.txt` lists all required packages
- **Extract Roots**: Dictionaries define where to place extracted files
- **Threading**: Parallel downloads tracked with `threadsLeft` counter
- **Compression**: Adjustable compression options for final ZIP

### 1.2 URL Parameter Format

```
https://rdd.latte.to/?channel=<CHANNEL>&binaryType=<BINARY>&version=<VERSION_HASH>
```

**Parameters:**
- `channel`: `LIVE` (default) or beta channel name
- `binaryType`: `WindowsPlayer`, `WindowsStudio64`, `MacPlayer`, `MacStudio`
- `version`: Optional version hash (e.g., `version-31fc142272764f02`)

**Without version**: Uses client settings to determine latest build

### 1.3 Core RDD Logic (from src/js/rdd.js)

```javascript
// Simplified flow from official RDD
const hostPath = "https://setup-aws.rbxcdn.com";

async function main() {
  // 1. Parse query parameters
  const params = new URLSearchParams(window.location.search);
  const channel = params.get('channel') || 'LIVE';
  const binaryType = params.get('binaryType');
  let version = params.get('version');
  
  if (version && !version.startsWith('version-')) {
    version = 'version-' + version;
  }
  
  // 2. Build paths
  const channelPath = channel === 'LIVE' ? hostPath : `${hostPath}/channel/${channel}`;
  const versionPath = `${channelPath}/${version}-`;
  
  // 3. Fetch manifest (Windows only)
  if (binaryType.includes('Windows')) {
    const manifest = await fetchManifest(versionPath);
    await downloadZipsFromManifest(manifest, versionPath);
  } else {
    // Mac: Direct download
    await downloadMacBinary(versionPath, binaryType);
  }
}

async function fetchManifest(versionPath) {
  const url = `${versionPath}rbxPkgManifest.txt`;
  const response = await fetch(url);
  return await response.text();
}

async function downloadZipsFromManifest(manifest, versionPath) {
  const lines = manifest.split('\n');
  const version = lines[0]; // Should be "v0"
  
  for (let i = 1; i < lines.length; i++) {
    const packageName = lines[i].trim();
    if (!packageName) continue;
    
    log(`⟳ Downloading ${packageName}...`);
    const zipData = await requestBinary(`${versionPath}${packageName}`);
    
    log(`⟳ Extracting ${packageName}...`);
    await extractZip(zipData, packageName);
    
    log(`✓ Completed ${packageName}`);
  }
  
  // Assemble final ZIP
  const finalZip = await assembleDeployment();
  downloadBinaryFile(finalZip, 'roblox-deployment.zip');
}
```

### 1.4 JSZip Integration

```javascript
import JSZip from 'jszip';

const finalZip = new JSZip();

async function extractZip(zipData, packageName) {
  const zip = await JSZip.loadAsync(zipData);
  const extractRoot = getExtractRoot(packageName);
  
  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const content = await file.async('arraybuffer');
      finalZip.file(`${extractRoot}/${filename}`, content);
    }
  }
}

async function assembleDeployment() {
  return await finalZip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}
```

---

## 2. inject.today's Implementation

### 2.1 UI Wrapper

**inject.today adds:**
- **Dropdowns**: Platform, Channel, Target, Version, Compression
- **Progress Bar**: Visual indicator of download progress
- **Terminal Window**: Collapsible log display with real-time updates
- **Dark Theme**: Matches their brand aesthetic
- **Install Button**: Triggers RDD download process

**Core Behavior:**
1. User selects options from dropdowns
2. Clicks "Install" button
3. Terminal opens and shows logs
4. Progress bar advances as packages download
5. Final ZIP downloads to browser
6. UI resets for next download

### 2.2 Dropdown Options

**Platform:**
- Windows
- Mac

**Channel:**
- LIVE (default)
- Beta channels (if available)

**Target:**
- Player
- Studio

**Version:**
- Latest (default)
- Rollback (shows historical versions)
- Specific (enter version hash)

**Compression:**
- Toggle for compression level

### 2.3 Terminal Logging

**Example log output:**
```
$ Starting download from rollback version
$ Fetching manifest from Roblox CDN...
✓ Found 47 packages
⟳ Downloading RobloxPlayerBeta.zip...
⟳ Extracting RobloxPlayerBeta.zip...
✓ Completed RobloxPlayerBeta.zip
⟳ Downloading content-fonts.zip...
⟳ Extracting content-fonts.zip...
✓ Completed content-fonts.zip
...
$ Assembling final deployment...
✓ Complete (100%)
```

**Log Types:**
- `$` - Info/status messages
- `✓` - Success messages (green)
- `⟳` - Progress messages (cyan)
- `✗` - Error messages (red)

---

## 3. Key-Kingdom Integration Strategy

### 3.1 Placement Options

#### Option A: Dedicated Page (Recommended)
**Route**: `/tools/rdd`

**Pros:**
- Clear separation from marketplace
- Room for detailed instructions
- Better SEO
- Can be linked from nav menu

**Cons:**
- Requires navigation away from main page

#### Option B: Modal/Overlay
**Trigger**: "Tools" menu → "RDD Downloader"

**Pros:**
- Quick access without navigation
- Stays in context of main site

**Cons:**
- Limited space for instructions
- May feel cramped on mobile

**Recommendation**: Use **Option A** (dedicated page) for better UX and discoverability.

### 3.2 Page Structure

```
/tools/rdd
├── Header (Key-Kingdom nav)
├── Page Title & Description
├── Configuration Panel (glassmorphic card)
│   ├── Platform dropdown
│   ├── Channel dropdown
│   ├── Target dropdown
│   ├── Version dropdown
│   ├── Compression toggle
│   └── Download button
├── Terminal Output (glassmorphic card)
│   ├── Log messages
│   ├── Progress bars
│   └── Copy/Clear buttons
└── Footer
```

### 3.3 Visual Design Alignment

**Match Key-Kingdom Brand:**
- **Colors**: Use `#0B0E11` background, `#5865F2` primary, etc.
- **Fonts**: Inter for UI, JetBrains Mono for terminal
- **Glassmorphism**: Apply to cards and panels
- **Animations**: Smooth transitions with Framer Motion

**Terminal Styling:**
- Background: `#0B0E11` (pure dark)
- Border: `1px solid rgba(0, 229, 255, 0.3)` (cyan accent)
- Font: JetBrains Mono 13px
- Text colors: Match log types (success, progress, error)

---

## 4. Component Specifications

### 4.1 RDD Configuration Panel

```tsx
// components/rdd/RDDConfig.tsx
export function RDDConfig({ config, onChange, onDownload, isDownloading }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Configuration</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Platform"
          value={config.platform}
          onChange={(v) => onChange({ ...config, platform: v })}
          options={[
            { value: 'windows', label: 'Windows' },
            { value: 'mac', label: 'Mac' },
          ]}
        />
        
        <Select
          label="Target"
          value={config.target}
          onChange={(v) => onChange({ ...config, target: v })}
          options={[
            { value: 'player', label: 'Player' },
            { value: 'studio', label: 'Studio' },
          ]}
        />
        
        <Select
          label="Channel"
          value={config.channel}
          onChange={(v) => onChange({ ...config, channel: v })}
          options={[
            { value: 'LIVE', label: 'LIVE' },
            { value: 'zintegration', label: 'Beta' },
          ]}
        />
        
        <VersionSelect
          value={config.version}
          onChange={(v) => onChange({ ...config, version: v })}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={config.compress}
          onChange={(v) => onChange({ ...config, compress: v })}
        />
        <label>Enable compression</label>
      </div>
      
      <Button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full"
      >
        {isDownloading ? 'Downloading...' : 'Download →'}
      </Button>
    </div>
  );
}
```

### 4.2 Version Dropdown

```tsx
// components/rdd/VersionSelect.tsx
export function VersionSelect({ value, onChange }) {
  const [mode, setMode] = useState<'latest' | 'rollback' | 'specific'>('latest');
  const { data: versions } = useVersions();
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Version</label>
      
      <div className="flex gap-2">
        <Button
          variant={mode === 'latest' ? 'primary' : 'ghost'}
          onClick={() => setMode('latest')}
        >
          Latest
        </Button>
        <Button
          variant={mode === 'rollback' ? 'primary' : 'ghost'}
          onClick={() => setMode('rollback')}
        >
          Rollback
        </Button>
        <Button
          variant={mode === 'specific' ? 'primary' : 'ghost'}
          onClick={() => setMode('specific')}
        >
          Specific
        </Button>
      </div>
      
      {mode === 'latest' && (
        <div className="text-sm text-muted">
          Will download the latest available version
        </div>
      )}
      
      {mode === 'rollback' && (
        <Select
          value={value}
          onChange={onChange}
          options={versions?.map(v => ({
            value: v.hash,
            label: `${v.hash} (${v.date})`,
          }))}
        />
      )}
      
      {mode === 'specific' && (
        <Input
          placeholder="version-31fc142272764f02"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
        />
      )}
    </div>
  );
}
```

### 4.3 Terminal Output

```tsx
// components/rdd/RDDTerminal.tsx
export function RDDTerminal({ logs, progress }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);
  
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold">Terminal Output</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
      
      <div
        ref={terminalRef}
        className="p-4 h-[400px] overflow-y-auto bg-background font-mono text-sm"
      >
        {logs.map((log, i) => (
          <LogLine key={i} log={log} />
        ))}
        
        {progress.current > 0 && (
          <div className="mt-2">
            <ProgressBar
              current={progress.current}
              total={progress.total}
            />
            <div className="text-xs text-muted mt-1">
              Overall progress: {progress.current}/{progress.total} packages ({Math.round(progress.current / progress.total * 100)}%)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogLine({ log }) {
  const getColor = () => {
    if (log.startsWith('✓')) return 'text-success';
    if (log.startsWith('⟳')) return 'text-accent-cyan';
    if (log.startsWith('✗')) return 'text-danger';
    return 'text-secondary';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${getColor()} leading-relaxed`}
    >
      {log}
    </motion.div>
  );
}
```

### 4.4 Progress Bar

```tsx
// components/rdd/ProgressBar.tsx
export function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="relative w-full h-2 bg-elevated rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent-cyan"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          boxShadow: '0 0 12px rgba(88, 101, 242, 0.6)',
        }}
      />
    </div>
  );
}
```

---

## 5. Implementation Guide

### 5.1 Setup

```bash
# Install dependencies
npm install jszip
npm install framer-motion  # If not already installed

# Create RDD directory structure
mkdir -p src/app/tools/rdd
mkdir -p src/components/rdd
mkdir -p src/lib/rdd
```

### 5.2 Core RDD Hook

```typescript
// lib/rdd/useRDD.ts
import { useState, useCallback } from 'react';
import JSZip from 'jszip';

export interface RDDConfig {
  platform: 'windows' | 'mac';
  target: 'player' | 'studio';
  channel: string;
  version?: string;
  compress: boolean;
}

export interface RDDLog {
  type: 'info' | 'success' | 'progress' | 'error';
  message: string;
  timestamp: Date;
}

export function useRDD() {
  const [logs, setLogs] = useState<RDDLog[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  const addLog = useCallback((type: RDDLog['type'], message: string) => {
    const prefix = {
      info: '$',
      success: '✓',
      progress: '⟳',
      error: '✗',
    }[type];
    
    setLogs(prev => [...prev, {
      type,
      message: `${prefix} ${message}`,
      timestamp: new Date(),
    }]);
  }, []);

  const startDownload = useCallback(async (config: RDDConfig) => {
    setIsDownloading(true);
    setLogs([]);
    setProgress({ current: 0, total: 0 });
    
    try {
      addLog('info', 'Initializing RDD...');
      
      // Build binary type
      const binaryType = config.platform === 'windows'
        ? `Windows${config.target === 'studio' ? 'Studio64' : 'Player'}`
        : `Mac${config.target === 'studio' ? 'Studio' : 'Player'}`;
      
      // Build paths
      const hostPath = 'https://setup-aws.rbxcdn.com';
      const channelPath = config.channel === 'LIVE'
        ? hostPath
        : `${hostPath}/channel/${config.channel}`;
      
      let versionPath = channelPath;
      if (config.version) {
        const version = config.version.startsWith('version-')
          ? config.version
          : `version-${config.version}`;
        versionPath = `${channelPath}/${version}`;
      }
      
      // Download based on platform
      if (config.platform === 'windows') {
        await downloadWindows(versionPath, binaryType, config, addLog, setProgress);
      } else {
        await downloadMac(versionPath, binaryType, config, addLog);
      }
      
      addLog('success', 'Download complete!');
    } catch (error) {
      addLog('error', `Error: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  }, [addLog]);

  return {
    logs,
    progress,
    isDownloading,
    startDownload,
  };
}

async function downloadWindows(
  versionPath: string,
  binaryType: string,
  config: RDDConfig,
  addLog: Function,
  setProgress: Function
) {
  // Fetch manifest
  addLog('info', 'Fetching manifest from Roblox CDN...');
  const manifestUrl = `${versionPath}-rbxPkgManifest.txt`;
  const manifestResponse = await fetch(manifestUrl);
  
  if (!manifestResponse.ok) {
    throw new Error('Failed to fetch manifest');
  }
  
  const manifestText = await manifestResponse.text();
  const packages = manifestText.split('\n').filter(p => p.trim());
  
  addLog('success', `Found ${packages.length} packages`);
  setProgress({ current: 0, total: packages.length });
  
  // Download and extract packages
  const finalZip = new JSZip();
  
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i].trim();
    if (!packageName || packageName === 'v0') continue;
    
    addLog('progress', `Downloading ${packageName}...`);
    const packageUrl = `${versionPath}-${packageName}`;
    const packageResponse = await fetch(packageUrl);
    const packageData = await packageResponse.arrayBuffer();
    
    addLog('progress', `Extracting ${packageName}...`);
    const packageZip = await JSZip.loadAsync(packageData);
    
    // Extract files to final ZIP
    for (const [filename, file] of Object.entries(packageZip.files)) {
      if (!file.dir) {
        const content = await file.async('arraybuffer');
        finalZip.file(filename, content);
      }
    }
    
    addLog('success', `Completed ${packageName}`);
    setProgress({ current: i + 1, total: packages.length });
  }
  
  // Generate final ZIP
  addLog('info', 'Assembling final deployment...');
  const finalBlob = await finalZip.generateAsync({
    type: 'blob',
    compression: config.compress ? 'DEFLATE' : 'STORE',
    compressionOptions: { level: 6 },
  });
  
  // Trigger download
  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roblox-${binaryType}-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadMac(
  versionPath: string,
  binaryType: string,
  config: RDDConfig,
  addLog: Function
) {
  // Mac is a single ZIP download
  const filename = binaryType === 'MacStudio' ? 'RobloxStudioApp.zip' : 'RobloxPlayer.zip';
  const url = `${versionPath}-${filename}`;
  
  addLog('info', `Downloading ${filename}...`);
  const response = await fetch(url);
  const blob = await response.blob();
  
  // Trigger download
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `roblox-${binaryType}-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(downloadUrl);
}
```

### 5.3 RDD Page

```typescript
// app/tools/rdd/page.tsx
'use client';

import { useState } from 'react';
import { RDDConfig } from '@/components/rdd/RDDConfig';
import { RDDTerminal } from '@/components/rdd/RDDTerminal';
import { useRDD } from '@/lib/rdd/useRDD';

export default function RDDPage() {
  const [config, setConfig] = useState({
    platform: 'windows',
    target: 'player',
    channel: 'LIVE',
    version: '',
    compress: true,
  });
  
  const { logs, progress, isDownloading, startDownload } = useRDD();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-page-title mb-2">Roblox Deployment Downloader</h1>
        <p className="text-secondary">
          Download any version of Roblox Player or Studio directly from Roblox's CDN.
          All processing happens in your browser - no server required.
        </p>
      </div>
      
      <div className="space-y-6">
        <RDDConfig
          config={config}
          onChange={setConfig}
          onDownload={() => startDownload(config)}
          isDownloading={isDownloading}
        />
        
        <RDDTerminal logs={logs} progress={progress} />
      </div>
      
      <div className="mt-8 p-4 bg-surface rounded-lg border border-white/10">
        <h3 className="text-sm font-semibold mb-2">About RDD</h3>
        <p className="text-sm text-secondary">
          RDD is an open-source tool (MIT license) that downloads official Roblox binaries
          directly from Roblox's CDN. Learn more at{' '}
          <a
            href="https://github.com/latte-soft/rdd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            github.com/latte-soft/rdd
          </a>
        </p>
      </div>
    </div>
  );
}
```

### 5.4 Version API Integration

```typescript
// app/api/rdd/versions/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Option 1: Use WEAO API if they provide version history
    const weaoResponse = await fetch('https://weao.xyz/api/versions');
    const versions = await weaoResponse.json();
    
    return NextResponse.json(versions);
  } catch (error) {
    // Option 2: Return hardcoded recent versions
    const fallbackVersions = [
      { hash: 'version-31fc142272764f02', date: '2024-11-23' },
      { hash: 'version-2f8a9b3e4c1d5f7a', date: '2024-11-22' },
      { hash: 'version-1d7c4f2a9e3b8c5d', date: '2024-11-21' },
      // Add more as needed
    ];
    
    return NextResponse.json(fallbackVersions);
  }
}
```

---

## 6. User Flow

### 6.1 Happy Path

1. **User navigates to `/tools/rdd`**
   - Page loads with configuration panel and empty terminal
   - Default: Windows Player, LIVE channel, Latest version

2. **User selects "Rollback"**
   - Version dropdown appears with historical versions
   - User selects specific version from list

3. **User clicks "Download"**
   - Button becomes disabled, shows "Downloading..."
   - Terminal starts showing logs in real-time
   - Progress bar appears and advances

4. **Download completes**
   - Terminal shows "✓ Complete (100%)"
   - Browser triggers ZIP file download
   - Button re-enables, ready for next download

### 6.2 Error Handling

**Manifest not found:**
```
✗ Error: Failed to fetch manifest
Possible causes:
- Invalid version hash
- Version not available for this channel
- Network connection issue
```

**Package download failed:**
```
⟳ Downloading content-fonts.zip...
✗ Error: Failed to download content-fonts.zip
Retrying (1/3)...
```

**Browser storage limit:**
```
✗ Error: Insufficient storage space
The deployment is too large to assemble in browser.
Try enabling compression or use a different device.
```

---

## 7. Testing Checklist

### Functionality
- [ ] Windows Player download works
- [ ] Windows Studio download works
- [ ] Mac Player download works
- [ ] Mac Studio download works
- [ ] Latest version selection works
- [ ] Rollback version selection works
- [ ] Specific version input works
- [ ] Compression toggle works
- [ ] Progress bar updates correctly
- [ ] Terminal logs appear in real-time
- [ ] Final ZIP downloads successfully

### UI/UX
- [ ] Configuration panel matches brand styling
- [ ] Terminal uses JetBrains Mono font
- [ ] Log colors match specifications
- [ ] Progress bar animates smoothly
- [ ] Copy button copies all logs
- [ ] Clear button clears terminal
- [ ] Responsive on mobile
- [ ] Glassmorphism applied correctly

### Error Handling
- [ ] Invalid version hash shows error
- [ ] Network failure shows retry option
- [ ] Large downloads don't crash browser
- [ ] Error messages are clear and helpful

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces status changes
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

---

## 8. Performance Considerations

### Browser Limits
- **Memory**: Large deployments (2-3GB) may cause issues on low-memory devices
- **Storage**: Browser storage limits may prevent assembly of very large ZIPs
- **CPU**: JSZip extraction is CPU-intensive, may freeze UI briefly

### Optimizations
1. **Web Workers**: Move JSZip processing to worker thread
2. **Streaming**: Use streaming APIs for large files
3. **Chunking**: Download packages in chunks to show progress
4. **Caching**: Cache manifest data to reduce API calls

### Recommendations
```typescript
// Use Web Worker for JSZip processing
const worker = new Worker('/workers/rdd-worker.js');

worker.postMessage({
  type: 'extract',
  data: packageData,
  filename: packageName,
});

worker.onmessage = (e) => {
  if (e.data.type === 'progress') {
    setProgress(e.data.progress);
  } else if (e.data.type === 'complete') {
    handleComplete(e.data.result);
  }
};
```

---

## 9. Future Enhancements

### Phase 2 Features
- [ ] Pause/resume downloads
- [ ] Download queue (multiple versions)
- [ ] Version comparison tool
- [ ] Automatic latest version check
- [ ] Download history

### Phase 3 Features
- [ ] Diff viewer (compare versions)
- [ ] Package explorer (view contents before download)
- [ ] Custom package selection
- [ ] Direct installation (if possible)

---

## 10. Related Documentation

- **`docs/UI_DESIGN_SYSTEM.md`** - Visual specifications
- **`docs/components/rdd-components.md`** - Detailed component specs
- **`docs/APP_SPEC.md`** - Overall app structure
- **Official RDD**: https://github.com/latte-soft/rdd
- **inject.today**: https://inject.today (reference implementation)

---

## Troubleshooting

### Slow "Assembling" Step

**Issue**: The assembling step shows 1% per minute or is very slow.

**Solutions**:
1. **Lower compression level**: Try levels 1-3 for faster processing
2. **Disable compression**: Turn off compression entirely for maximum speed
3. **Browser memory**: Close other tabs to free up browser memory
4. **File size**: Windows Studio downloads are large (2-3GB) and take longer

**Technical explanation**: JSZip's `generateAsync` with high compression levels (7-9) is CPU-intensive. Lower levels significantly improve speed with minimal size impact.

### Getting Bootstrapper .exe Instead of ZIP

**Issue**: Download returns a `.exe` file instead of a `.zip`.

**Solutions**:
1. **Check binary type**: Ensure you selected the correct binary type from the dropdown
2. **Check browser**: Some browsers may misidentify the file type
3. **Check file extension**: Rename the file to `.zip` if it's actually a ZIP with wrong extension

**Note**: The current implementation ALWAYS outputs ZIP files. If you're seeing a bare `.exe`, it's likely a browser download issue, not a code issue.

### Version Resolution Fails

**Issue**: "Failed to resolve latest version" error.

**Solutions**:
1. **Check WEAO status**: WEAO may be down temporarily
2. **Use manual mode**: Switch to "Manual Version" and enter a specific version hash
3. **Check network**: Ensure you have internet connectivity
4. **Try fallback**: The system automatically falls back to Roblox clientsettings API

**Technical**: The system tries WEAO → clientsettings v2 → clientsettings v1 in sequence.

### WEAO 502 Errors

**Issue**: Seeing `WEAO proxy returned 502` in logs.

**Status**: This is logged but **non-fatal**. The system automatically:
1. Falls back to Roblox clientsettings API
2. Returns valid version data
3. Continues download normally

**No action needed** - this is expected behavior when WEAO is temporarily unavailable.

---

## Recent Changes (2025-11-23)

### 🚀 **MAJOR REFACTOR: Delegated Architecture**

**What Changed:**
- ✅ **Removed client-side JSZip assembly** - No more slow "1% per minute" processing
- ✅ **Delegated to Latte's RDD** - All downloads now go through rdd.latte.to
- ✅ **Simplified codebase** - ~400 lines of JSZip code removed
- ✅ **Faster downloads** - Latte's battle-tested parallel download implementation
- ✅ **Better reliability** - Proven stability from thousands of successful downloads

**How It Works Now:**
1. User configures download in Key-Kingdom UI
2. If "Latest" mode: resolve version from WEAO/clientsettings
3. Build URL: `https://rdd.latte.to/?channel=LIVE&binaryType=WindowsPlayer&version=...&compressZip=true&compressionLevel=5`
4. Open URL in new window
5. Latte's RDD handles everything: manifest, packages, ZIP assembly, download

**Files Changed:**
- `src/lib/rdd/useRDD.ts` - Complete rewrite (120 lines vs 400+ before)
- `src/lib/rdd/buildRddUrl.ts` - New helper for URL construction
- `src/lib/rdd/resolveVersion.ts` - New helper for version resolution
- `src/components/rdd/RDDConfig.tsx` - Updated to use `binaryType` instead of `platform`/`target`
- `src/app/tools/rdd/page.tsx` - Updated config structure
- `docs/RDD_IMPLEMENTATION.md` - Complete documentation rewrite

**API Routes (Now Optional):**
- `/api/rdd/manifest` - No longer used, can be removed
- `/api/rdd/package` - No longer used, can be removed
- `/api/weao/versions/current` - Still used for version resolution in "Latest" mode

**Migration Notes:**
- Old config had `platform` + `target`, new config has `binaryType`
- Default compression level changed from 6 to 5 (Latte's default)
- No more progress tracking - download happens in external tab

---

**Last Updated**: 2025-11-23 (Full enhancement with inject.today/rdd parity)
**Status**: Production-ready with advanced controls
**Version**: 2.0
