"use client";

import { Button } from '@/components/ui/Button';
import { VersionSelect } from './VersionSelect';
import { RDDConfig as RDDConfigType } from '@/lib/rdd/useRDD';

interface RDDConfigProps {
  config: RDDConfigType;
  onChange: (config: RDDConfigType) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export function RDDConfig({
  config,
  onChange,
  onDownload,
  isDownloading
}: RDDConfigProps) {
  return (
    <div
      className="p-6 space-y-6 rounded-2xl border border-white/10 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.95) 0%, rgba(30, 35, 41, 0.95) 100%)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div>
        <h2 className="text-xl font-semibold mb-1 text-text-primary">Configuration</h2>
        <p className="text-sm text-text-muted">
          Select your download options below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platform */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Platform</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...config, platform: 'windows' })}
              className={`p-3 rounded-lg border transition-all ${
                config.platform === 'windows'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background-surface border-white/10 text-text-secondary hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
                <span className="font-medium">Windows</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, platform: 'mac' })}
              className={`p-3 rounded-lg border transition-all ${
                config.platform === 'mac'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background-surface border-white/10 text-text-secondary hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="font-medium">Mac</span>
              </div>
            </button>
          </div>
        </div>

        {/* Target */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Target</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...config, target: 'player' })}
              className={`p-3 rounded-lg border transition-all ${
                config.target === 'player'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background-surface border-white/10 text-text-secondary hover:border-primary/50'
              }`}
            >
              <span className="font-medium">Player</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, target: 'studio' })}
              className={`p-3 rounded-lg border transition-all ${
                config.target === 'studio'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background-surface border-white/10 text-text-secondary hover:border-primary/50'
              }`}
            >
              <span className="font-medium">Studio</span>
            </button>
          </div>
        </div>

        {/* Channel */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Channel</label>
          <select
            value={config.channel}
            onChange={(e) => onChange({ ...config, channel: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-background-elevated bg-background-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="LIVE">LIVE (Production)</option>
            <option value="zintegration">Beta</option>
          </select>
        </div>

        {/* Version */}
        <VersionSelect
          value={config.version}
          onChange={(v) => onChange({ ...config, version: v })}
        />
      </div>

      {/* Compression Toggle */}
      <div className="flex items-center gap-3 p-4 bg-background-surface rounded-lg border border-white/10">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.compress}
            onChange={(e) => onChange({ ...config, compress: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
        <div className="flex-1">
          <div className="font-medium text-text-primary text-sm">Enable Compression</div>
          <div className="text-xs text-text-muted">
            Reduces file size but takes longer to process
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full relative overflow-hidden group"
        size="lg"
        type="button"
      >
        {isDownloading ? (
          <>
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <span className="relative z-10 flex items-center justify-center">
              Download
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary to-[#00E5FF] opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </>
        )}
      </Button>
    </div>
  );
}
