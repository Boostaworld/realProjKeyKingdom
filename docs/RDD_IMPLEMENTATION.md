# RDD_IMPLEMENTATION.md

**Roblox Deployment Downloader Integration for Key-Kingdom**

---

## Purpose

This document specifies how to integrate RDD (Roblox Deployment Downloader) functionality into Key-Kingdom, matching inject.today's implementation while maintaining Key-Kingdom's brand identity and design system.

**Related Documentation:**
- `docs/UI_DESIGN_SYSTEM.md` - Visual specifications for RDD components
- `docs/components/rdd-components.md` - Detailed component specs
- `docs/APP_SPEC.md` - Overall application structure

---

## Quick Reference

### What is RDD?
- **Open-source tool** (MIT license) for downloading Roblox client/studio binaries
- **Client-side only** - No backend required, runs entirely in browser
- **Uses JSZip** - Assembles packages from Roblox CDN in-browser
- **Official host**: https://rdd.latte.to
- **GitHub**: https://github.com/latte-soft/rdd

### Key Features
- Download any Roblox version (current or historical)
- Support for Windows Player/Studio and Mac Player/Studio
- Rollback to previous versions
- Real-time progress tracking
- Terminal-style logging

### inject.today Implementation
- Polished UI wrapper around RDD core logic
- Dropdowns for platform, channel, target, version
- Progress bar and collapsible terminal
- Dark-themed interface matching their brand

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

**Last Updated**: Based on ChatGPT RDD analysis (Nov 2024)  
**Status**: Ready for implementation  
**Version**: 1.0
