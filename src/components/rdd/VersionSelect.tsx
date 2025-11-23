"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface VersionSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function VersionSelect({ value, onChange }: VersionSelectProps) {
  const [mode, setMode] = useState<'latest' | 'specific'>('latest');

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-primary">Version</label>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'latest' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            setMode('latest');
            onChange('');
          }}
          type="button"
        >
          Latest
        </Button>
        <Button
          variant={mode === 'specific' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('specific')}
          type="button"
        >
          Specific Version
        </Button>
      </div>

      {/* Mode-specific UI */}
      {mode === 'latest' && (
        <div
          className="p-3 rounded-lg border border-white/10 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.7) 0%, rgba(30, 35, 41, 0.7) 100%)',
          }}
        >
          <div className="text-sm text-text-secondary">
            Will download the latest available version from Roblox CDN
          </div>
        </div>
      )}

      {mode === 'specific' && (
        <div className="space-y-2">
          <Input
            placeholder="version-31fc142272764f02"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm px-4"
          />
          <div className="text-xs text-text-muted px-1">
            Enter a specific version hash (with or without &quot;version-&quot; prefix)
          </div>
        </div>
      )}
    </div>
  );
}
