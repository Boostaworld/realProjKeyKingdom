"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RDDConfig } from '@/components/rdd/RDDConfig';
import { RDDTerminal } from '@/components/rdd/RDDTerminal';
import { useRDD } from '@/lib/rdd/useRDD';

export default function RDDPage() {
  const [config, setConfig] = useState({
    binaryType: 'WindowsPlayer' as const,
    channel: 'LIVE',
    version: '',
    versionMode: 'latest' as const,
    compress: true,
    compressionLevel: 5, // Balanced compression (1-9 scale, default 5)
  });

  const { logs, isDownloading, startDownload, clearLogs } = useRDD();

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#5865F2] to-[#00E5FF] bg-clip-text text-transparent">
            Roblox Deployment Downloader
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Download any version of Roblox Player or Studio directly from Roblox&apos;s CDN.
            Powered by <a href="https://rdd.latte.to" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Latte&apos;s RDD</a> - fast, reliable, and battle-tested.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <RDDConfig
            config={config}
            onChange={setConfig}
            onDownload={() => startDownload(config)}
            isDownloading={isDownloading}
          />

          <RDDTerminal
            logs={logs}
            progress={{ current: 0, total: 0 }}
            onClear={clearLogs}
          />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-4 bg-background-surface rounded-lg border border-white/10"
        >
          <h3 className="text-sm font-semibold mb-2 text-text-primary">About RDD</h3>
          <p className="text-sm text-text-secondary">
            RDD is an open-source tool (MIT license) that downloads official Roblox binaries
            directly from Roblox&apos;s CDN. This tool delegates all downloads to{' '}
            <a
              href="https://rdd.latte.to"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              rdd.latte.to
            </a>
            {' '}for optimal performance. Learn more at{' '}
            <a
              href="https://github.com/latte-soft/rdd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              github.com/latte-soft/rdd
            </a>
          </p>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="p-4 bg-background-surface rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#43B581]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h4 className="font-semibold text-text-primary">Fast & Optimized</h4>
            </div>
            <p className="text-xs text-text-secondary">
              Powered by Latte&apos;s RDD - battle-tested implementation with parallel downloads and optimized ZIP assembly.
            </p>
          </div>

          <div className="p-4 bg-background-surface rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h4 className="font-semibold text-text-primary">Official Sources</h4>
            </div>
            <p className="text-xs text-text-secondary">
              Downloads directly from Roblox&apos;s official CDN - no third-party mirrors or modifications.
            </p>
          </div>

          <div className="p-4 bg-background-surface rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-text-primary">Version Flexibility</h4>
            </div>
            <p className="text-xs text-text-secondary">
              Download latest versions automatically or specify exact version hashes for testing and compatibility.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
