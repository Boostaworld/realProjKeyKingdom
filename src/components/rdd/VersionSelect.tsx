"use client";

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RDDConfig } from '@/lib/rdd/useRDD';

interface VersionSelectProps {
  config: RDDConfig;
  onChange: (updates: Partial<RDDConfig>) => void;
}

export function VersionSelect({ config, onChange }: VersionSelectProps) {
  const { versionMode, version } = config;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-primary">Version</label>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={versionMode === 'latest' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChange({ versionMode: 'latest', version: '' })}
          type="button"
        >
          Latest Version
        </Button>
        <Button
          variant={versionMode === 'manual' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChange({ versionMode: 'manual' })}
          type="button"
        >
          Manual Version
        </Button>
      </div>

      {/* Mode-specific UI */}
      {versionMode === 'latest' && (
        <div
          className="p-3 rounded-lg border border-white/10 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.7) 0%, rgba(30, 35, 41, 0.7) 100%)',
          }}
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-sm text-text-secondary">
              Will automatically resolve and download the latest version from Roblox CDN using clientsettings API
            </div>
          </div>
        </div>
      )}

      {versionMode === 'manual' && (
        <div className="space-y-2">
          <Input
            placeholder="version-31fc142272764f02 or e380c8edc8f6477c"
            value={version || ''}
            onChange={(e) => onChange({ version: e.target.value })}
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
