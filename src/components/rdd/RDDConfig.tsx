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
        {/* Binary Type Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Binary Type</label>
          <select
            value={`${config.platform}-${config.target}`}
            onChange={(e) => {
              const [platform, target] = e.target.value.split('-') as ['windows' | 'mac', 'player' | 'studio'];
              onChange({ ...config, platform, target });
            }}
            className="w-full h-11 px-4 rounded-lg border border-white/10 bg-background-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.7) 0%, rgba(30, 35, 41, 0.7) 100%)',
            }}
          >
            <option value="windows-player">WindowsPlayer</option>
            <option value="windows-studio">WindowsStudio64</option>
            <option value="mac-player">MacPlayer</option>
            <option value="mac-studio">MacStudio</option>
          </select>
          <div className="text-xs text-text-muted px-1">
            Select the Roblox binary type to download
          </div>
        </div>

        {/* Channel */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Channel</label>
          <select
            value={config.channel}
            onChange={(e) => onChange({ ...config, channel: e.target.value })}
            className="w-full h-10 px-4 rounded-lg border border-white/10 bg-background-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.7) 0%, rgba(30, 35, 41, 0.7) 100%)',
            }}
          >
            <option value="LIVE">LIVE (Production)</option>
            <option value="zintegration">Beta</option>
          </select>
        </div>

        {/* Version */}
        <VersionSelect
          config={config}
          onChange={(updates) => onChange({ ...config, ...updates })}
        />
      </div>

      {/* Compression Settings */}
      <div className="space-y-4 p-4 bg-background-surface rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
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
              Compress the output ZIP file to reduce size
            </div>
          </div>
        </div>

        {/* Compression Level */}
        {config.compress && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                Compression Level
              </label>
              <span className="text-sm font-mono text-primary">{config.compressionLevel}</span>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              value={config.compressionLevel}
              onChange={(e) => onChange({ ...config, compressionLevel: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>1 (Fastest)</span>
              <span>5 (Balanced)</span>
              <span>9 (Best)</span>
            </div>
            <div className="text-xs text-text-muted px-1">
              Higher levels provide better compression but take longer to process
            </div>
          </div>
        )}
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
