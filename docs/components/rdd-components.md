# rdd-components.md

**RDD Component Specifications**

---

## Purpose

Detailed specifications for all RDD-related UI components, including props, styling, behavior, and code examples.

**Parent Documentation:**
- `docs/RDD_IMPLEMENTATION.md` - Overall RDD integration strategy
- `docs/UI_DESIGN_SYSTEM.md` - Visual design system

---

## Component Index

1. [RDDConfig](../../../../../AppData/Local/Temp/641a691e-e1b6-408d-ab73-98e3f761dd28_repo_updates.zip.repo_updates.zip/repo_updates/components/rdd-components.md#1-rddconfig) - Configuration panel
2. [VersionSelect](../../../../../AppData/Local/Temp/641a691e-e1b6-408d-ab73-98e3f761dd28_repo_updates.zip.repo_updates.zip/repo_updates/components/rdd-components.md#2-versionselect) - Version selection dropdown
3. [RDDTerminal](../../../../../AppData/Local/Temp/641a691e-e1b6-408d-ab73-98e3f761dd28_repo_updates.zip.repo_updates.zip/repo_updates/components/rdd-components.md#3-rddterminal) - Terminal output display
4. [LogLine](../../../../../AppData/Local/Temp/641a691e-e1b6-408d-ab73-98e3f761dd28_repo_updates.zip.repo_updates.zip/repo_updates/components/rdd-components.md#4-logline) - Individual log message
5. [ProgressBar](../../../../../AppData/Local/Temp/641a691e-e1b6-408d-ab73-98e3f761dd28_repo_updates.zip.repo_updates.zip/repo_updates/components/rdd-components.md#5-progressbar) - Download progress indicator

---

## 1. RDDConfig

**Purpose**: Main configuration panel for RDD download options.

### Props

```typescript
interface RDDConfigProps {
  config: RDDConfig;
  onChange: (config: RDDConfig) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

interface RDDConfig {
  platform: 'windows' | 'mac';
  target: 'player' | 'studio';
  channel: string;
  version?: string;
  compress: boolean;
}
```

### Implementation

```tsx
// components/rdd/RDDConfig.tsx
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { VersionSelect } from './VersionSelect';

export function RDDConfig({
  config,
  onChange,
  onDownload,
  isDownloading
}: RDDConfigProps) {
  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Configuration</h2>
        <p className="text-sm text-muted">
          Select your download options below
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platform */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform</label>
          <Select
            value={config.platform}
            onChange={(v) => onChange({ ...config, platform: v })}
            options={[
              { value: 'windows', label: '🖥️ Windows', icon: WindowsIcon },
              { value: 'mac', label: '🍎 Mac', icon: AppleIcon },
            ]}
          />
        </div>
        
        {/* Target */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target</label>
          <Select
            value={config.target}
            onChange={(v) => onChange({ ...config, target: v })}
            options={[
              { value: 'player', label: 'Player' },
              { value: 'studio', label: 'Studio' },
            ]}
          />
        </div>
        
        {/* Channel */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Channel</label>
          <Select
            value={config.channel}
            onChange={(v) => onChange({ ...config, channel: v })}
            options={[
              { value: 'LIVE', label: 'LIVE (Production)' },
              { value: 'zintegration', label: 'Beta' },
            ]}
          />
        </div>
        
        {/* Version */}
        <VersionSelect
          value={config.version}
          onChange={(v) => onChange({ ...config, version: v })}
        />
      </div>
      
      {/* Compression Toggle */}
      <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-white/10">
        <Switch
          checked={config.compress}
          onChange={(v) => onChange({ ...config, compress: v })}
          id="compress"
        />
        <label htmlFor="compress" className="text-sm cursor-pointer">
          <div className="font-medium">Enable Compression</div>
          <div className="text-xs text-muted">
            Reduces file size but takes longer to process
          </div>
        </label>
      </div>
      
      {/* Download Button */}
      <Button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full"
        size="lg"
      >
        {isDownloading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Downloading...
          </>
        ) : (
          <>
            Download
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
```

### Styling

```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(21, 26, 33, 0.95) 0%,
    rgba(30, 35, 41, 0.95) 100%
  );
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

---

## 2. VersionSelect

**Purpose**: Dropdown for selecting Roblox version (Latest, Rollback, or Specific).

### Props

```typescript
interface VersionSelectProps {
  value?: string;
  onChange: (value: string) => void;
}
```

### Implementation

```tsx
// components/rdd/VersionSelect.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function VersionSelect({ value, onChange }: VersionSelectProps) {
  const [mode, setMode] = useState<'latest' | 'rollback' | 'specific'>('latest');
  
  const { data: versions, isLoading } = useQuery({
    queryKey: ['rdd-versions'],
    queryFn: async () => {
      const res = await fetch('/api/rdd/versions');
      return res.json();
    },
    enabled: mode === 'rollback',
  });
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Version</label>
      
      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'latest' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            setMode('latest');
            onChange('');
          }}
        >
          Latest
        </Button>
        <Button
          variant={mode === 'rollback' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('rollback')}
        >
          Rollback
        </Button>
        <Button
          variant={mode === 'specific' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('specific')}
        >
          Specific
        </Button>
      </div>
      
      {/* Mode-specific UI */}
      {mode === 'latest' && (
        <div className="p-3 bg-surface rounded-lg border border-white/10">
          <div className="text-sm text-secondary">
            Will download the latest available version from Roblox CDN
          </div>
        </div>
      )}
      
      {mode === 'rollback' && (
        <div className="space-y-2">
          {isLoading ? (
            <div className="p-3 bg-surface rounded-lg border border-white/10">
              <Spinner className="w-4 h-4" />
              <span className="text-sm text-muted ml-2">Loading versions...</span>
            </div>
          ) : (
            <Select
              value={value}
              onChange={onChange}
              options={versions?.map(v => ({
                value: v.hash,
                label: (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{v.hash}</span>
                    <span className="text-xs text-muted">{v.date}</span>
                  </div>
                ),
              }))}
              placeholder="Select a version..."
            />
          )}
          <div className="text-xs text-muted">
            Select a previous version to download
          </div>
        </div>
      )}
      
      {mode === 'specific' && (
        <div className="space-y-2">
          <Input
            placeholder="version-31fc142272764f02"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted">
            Enter a specific version hash (with or without "version-" prefix)
          </div>
        </div>
      )}
    </div>
  );
}
```

### Behavior

- **Latest**: Default mode, no input needed
- **Rollback**: Fetches version list from API, shows dropdown
- **Specific**: Text input for manual version hash entry
- **Validation**: Auto-adds "version-" prefix if missing

---

## 3. RDDTerminal

**Purpose**: Terminal-style output display for RDD logs and progress.

### Props

```typescript
interface RDDTerminalProps {
  logs: RDDLog[];
  progress: {
    current: number;
    total: number;
  };
}

interface RDDLog {
  type: 'info' | 'success' | 'progress' | 'error';
  message: string;
  timestamp: Date;
}
```

### Implementation

```tsx
// components/rdd/RDDTerminal.tsx
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LogLine } from './LogLine';
import { ProgressBar } from './ProgressBar';

export function RDDTerminal({ logs, progress }: RDDTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);
  
  const handleCopy = () => {
    const text = logs.map(log => log.message).join('\n');
    navigator.clipboard.writeText(text);
    // Show toast notification
  };
  
  const handleClear = () => {
    // Clear logs (implement via parent state)
  };
  
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-accent-cyan" />
          <h2 className="text-lg font-semibold">Terminal Output</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={logs.length === 0}
          >
            <CopyIcon className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={logs.length === 0}
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="p-4 h-[400px] overflow-y-auto bg-background font-mono text-sm scrollbar-thin scrollbar-thumb-elevated scrollbar-track-transparent"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted">
            <div className="text-center">
              <TerminalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Terminal output will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <LogLine key={i} log={log} />
            ))}
            
            {/* Progress Bar */}
            {progress.total > 0 && (
              <div className="mt-4 space-y-2">
                <ProgressBar
                  current={progress.current}
                  total={progress.total}
                />
                <div className="text-xs text-muted">
                  Overall progress: {progress.current}/{progress.total} packages
                  ({Math.round((progress.current / progress.total) * 100)}%)
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Styling

```css
/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-thumb-elevated::-webkit-scrollbar-thumb {
  background: rgba(30, 35, 41, 0.8);
  border-radius: 4px;
}

.scrollbar-thumb-elevated::-webkit-scrollbar-thumb:hover {
  background: rgba(30, 35, 41, 1);
}
```

### Behavior

- **Auto-scroll**: Scrolls to bottom when new logs appear
- **Copy**: Copies all logs to clipboard
- **Clear**: Clears all logs (confirm dialog recommended)
- **Empty state**: Shows placeholder when no logs

---

## 4. LogLine

**Purpose**: Individual log message with type-based styling.

### Props

```typescript
interface LogLineProps {
  log: RDDLog;
}
```

### Implementation

```tsx
// components/rdd/LogLine.tsx
import { motion } from 'framer-motion';

export function LogLine({ log }: LogLineProps) {
  const getColor = () => {
    switch (log.type) {
      case 'success':
        return 'text-success';
      case 'progress':
        return 'text-accent-cyan';
      case 'error':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };
  
  const getIcon = () => {
    switch (log.type) {
      case 'success':
        return '✓';
      case 'progress':
        return '⟳';
      case 'error':
        return '✗';
      default:
        return '$';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`${getColor()} leading-relaxed flex items-start gap-2`}
    >
      <span className="flex-shrink-0 w-4">{getIcon()}</span>
      <span className="flex-1">{log.message}</span>
      <span className="flex-shrink-0 text-xs text-muted">
        {log.timestamp.toLocaleTimeString()}
      </span>
    </motion.div>
  );
}
```

### Log Types

| Type | Icon | Color | Usage |
|------|------|-------|-------|
| `info` | `$` | `text-secondary` | Status messages |
| `success` | `✓` | `text-success` | Completed operations |
| `progress` | `⟳` | `text-accent-cyan` | Ongoing operations |
| `error` | `✗` | `text-danger` | Error messages |

---

## 5. ProgressBar

**Purpose**: Animated progress bar for download status.

### Props

```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}
```

### Implementation

```tsx
// components/rdd/ProgressBar.tsx
import { motion } from 'framer-motion';

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className={`relative w-full h-2 bg-elevated rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent-cyan rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        style={{
          boxShadow: '0 0 12px rgba(88, 101, 242, 0.6)',
        }}
      />
    </div>
  );
}
```

### Variants

**With Label:**
```tsx
<div className="space-y-1">
  <div className="flex justify-between text-xs">
    <span className="text-secondary">Downloading packages...</span>
    <span className="text-muted">{percentage}%</span>
  </div>
  <ProgressBar current={current} total={total} />
</div>
```

**Package-Specific:**
```tsx
<div className="space-y-2">
  <div className="text-sm text-secondary">content-fonts.zip</div>
  <ProgressBar current={bytesDownloaded} total={totalBytes} />
  <div className="text-xs text-muted">
    {formatBytes(bytesDownloaded)} / {formatBytes(totalBytes)}
  </div>
</div>
```

---

## 6. Usage Example

### Complete RDD Page

```tsx
// app/tools/rdd/page.tsx
'use client';

import { useState } from 'react';
import { RDDConfig } from '@/components/rdd/RDDConfig';
import { RDDTerminal } from '@/components/rdd/RDDTerminal';
import { useRDD } from '@/lib/rdd/useRDD';

export default function RDDPage() {
  const [config, setConfig] = useState({
    platform: 'windows' as const,
    target: 'player' as const,
    channel: 'LIVE',
    version: '',
    compress: true,
  });
  
  const { logs, progress, isDownloading, startDownload } = useRDD();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-page-title mb-2">
          Roblox Deployment Downloader
        </h1>
        <p className="text-secondary max-w-2xl">
          Download any version of Roblox Player or Studio directly from Roblox's CDN.
          All processing happens in your browser - no server required.
        </p>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        <RDDConfig
          config={config}
          onChange={setConfig}
          onDownload={() => startDownload(config)}
          isDownloading={isDownloading}
        />
        
        <RDDTerminal logs={logs} progress={progress} />
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 p-4 bg-surface rounded-lg border border-white/10">
        <h3 className="text-sm font-semibold mb-2">About RDD</h3>
        <p className="text-sm text-secondary">
          RDD is an open-source tool (MIT license) that downloads official Roblox binaries
          directly from Roblox's CDN. No server-side processing is involved - everything
          runs in your browser using JSZip. Learn more at{' '}
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

---

## 7. Testing Checklist

### RDDConfig
- [ ] All dropdowns work correctly
- [ ] Version mode switching works
- [ ] Compression toggle works
- [ ] Download button disables during download
- [ ] Loading spinner shows when downloading
- [ ] Responsive on mobile

### VersionSelect
- [ ] Latest mode shows info message
- [ ] Rollback mode fetches versions
- [ ] Specific mode accepts input
- [ ] Version hash validation works
- [ ] Dropdown shows version dates

### RDDTerminal
- [ ] Logs appear in real-time
- [ ] Auto-scrolls to bottom
- [ ] Copy button works
- [ ] Clear button works
- [ ] Empty state shows
- [ ] Progress bar updates

### LogLine
- [ ] Colors match log types
- [ ] Icons display correctly
- [ ] Timestamps show
- [ ] Animation plays smoothly

### ProgressBar
- [ ] Animates smoothly
- [ ] Percentage calculates correctly
- [ ] Glow effect visible
- [ ] Gradient displays

---

## 8. Accessibility

### Keyboard Navigation
```tsx
// All buttons must be keyboard accessible
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
```

### Screen Reader Support
```tsx
// Status announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {isDownloading && `Downloading: ${progress.current} of ${progress.total} packages`}
</div>

// Progress bar
<div
  role="progressbar"
  aria-valuenow={progress.current}
  aria-valuemin={0}
  aria-valuemax={progress.total}
  aria-label="Download progress"
>
```

### Focus Management
```tsx
// Focus terminal when download starts
useEffect(() => {
  if (isDownloading && terminalRef.current) {
    terminalRef.current.focus();
  }
}, [isDownloading]);
```

---

## Related Documentation

- **`docs/RDD_IMPLEMENTATION.md`** - Overall RDD integration
- **`docs/UI_DESIGN_SYSTEM.md`** - Visual design system
- **`docs/components/shop-components.md`** - Other component specs

---

**Last Updated**: Nov 2024  
**Status**: Ready for implementation  
**Version**: 1.0
