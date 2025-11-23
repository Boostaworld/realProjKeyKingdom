/**
 * RDD Hook - Delegates to Latte's RDD service
 *
 * This hook NO LONGER does client-side ZIP assembly with JSZip.
 * Instead, it:
 * 1. Resolves the version (if auto mode)
 * 2. Builds the correct Latte RDD URL
 * 3. Opens that URL to trigger the download
 *
 * All heavy lifting (manifest parsing, package downloading, ZIP assembly)
 * is delegated to https://rdd.latte.to, which is battle-tested and optimized.
 *
 * Performance: Fast! No more "1% per minute" assembly because Latte's RDD
 * does parallel downloads and optimized ZIP generation.
 */

import { useState, useCallback } from "react";
import { RddBinaryType, buildRddUrl } from "./buildRddUrl";
import { resolveLatestVersion } from "./resolveVersion";

export interface RDDConfig {
  binaryType: RddBinaryType;
  channel: string;
  version?: string;
  versionMode: "latest" | "manual";
  compress: boolean;
  compressionLevel: number; // 1-9
}

export interface RDDLog {
  type: "info" | "success" | "progress" | "error";
  message: string;
  timestamp: Date;
}

export function useRDD() {
  const [logs, setLogs] = useState<RDDLog[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const addLog = useCallback((type: RDDLog["type"], message: string) => {
    const prefix = {
      info: "$",
      success: "✓",
      progress: "⟳",
      error: "✗",
    }[type];

    setLogs((prev) => [
      ...prev,
      {
        type,
        message: `${prefix} ${message}`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const startDownload = useCallback(
    async (config: RDDConfig) => {
      setIsDownloading(true);
      setLogs([]);

      try {
        addLog("info", "Initializing RDD download...");
        addLog("info", `Binary Type: ${config.binaryType}`);
        addLog("info", `Channel: ${config.channel}`);
        addLog(
          "info",
          `Version Mode: ${config.versionMode === "latest" ? "Auto (latest)" : "Manual"}`
        );

        let resolvedVersion: string | undefined = config.version;

        // Resolve version if in auto mode
        if (config.versionMode === "latest") {
          addLog("progress", "Resolving latest version from WEAO/clientsettings...");

          try {
            resolvedVersion = await resolveLatestVersion(config.binaryType, config.channel);
            addLog("success", `Resolved version: ${resolvedVersion}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Version resolution failed: ${errorMessage}`);
          }
        } else if (resolvedVersion) {
          // Manual mode with explicit version
          addLog("info", `Using manual version: ${resolvedVersion}`);
        }

        // Build the Latte RDD URL
        addLog("progress", "Building download URL...");

        const rddUrl = buildRddUrl({
          channel: config.channel,
          binaryType: config.binaryType,
          version: resolvedVersion,
          compressZip: config.compress,
          compressionLevel: config.compressionLevel,
        });

        addLog("success", "Download URL ready!");
        addLog("info", `URL: ${rddUrl}`);

        // Show compression settings
        if (config.compress) {
          addLog(
            "info",
            `Compression: Enabled (level ${config.compressionLevel})`
          );
        } else {
          addLog("info", "Compression: Disabled (faster, larger file)");
        }

        // Open the Latte RDD URL in a new window
        // This delegates all the heavy work to Latte's battle-tested implementation
        addLog("progress", "Opening Latte's RDD service...");
        addLog("info", "Download will start in new window/tab");

        window.open(rddUrl, "_blank");

        addLog("success", "Redirected to Latte's RDD!");
        addLog(
          "info",
          "The download will be handled by rdd.latte.to - check your new tab"
        );
        addLog(
          "info",
          "You can close this tab or start another download"
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        addLog("error", `Error: ${errorMessage}`);

        // Show fallback instructions
        addLog("info", "Troubleshooting:");
        addLog("info", "- Check your internet connection");
        addLog("info", "- Try manual version mode with a specific version hash");
        addLog("info", "- Verify the channel name is correct (usually 'LIVE')");
      } finally {
        setIsDownloading(false);
      }
    },
    [addLog]
  );

  return {
    logs,
    isDownloading,
    startDownload,
    clearLogs,
  };
}
