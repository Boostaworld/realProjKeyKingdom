"use client";

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LogLine } from './LogLine';
import { ProgressBar } from './ProgressBar';
import { RDDLog } from '@/lib/rdd/useRDD';

interface RDDTerminalProps {
  logs: RDDLog[];
  progress: {
    current: number;
    total: number;
  };
  onClear?: () => void;
}

export function RDDTerminal({ logs, progress, onClear }: RDDTerminalProps) {
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
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(21, 26, 33, 0.95) 0%, rgba(30, 35, 41, 0.95) 100%)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-text-primary">Terminal Output</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={logs.length === 0}
            type="button"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </Button>
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={logs.length === 0}
              type="button"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="p-4 h-[400px] overflow-y-auto bg-[#0B0E11] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Terminal output will appear here</p>
              <p className="text-xs mt-1 opacity-75">Click &quot;Download&quot; to begin</p>
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
                <div className="text-xs text-text-muted font-mono">
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
