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

  const clearLogs = useCallback(() => {
    setLogs([]);
    setProgress({ current: 0, total: 0 });
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

      addLog('info', `Target: ${binaryType}`);

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
        addLog('info', `Version: ${version}`);
      } else {
        addLog('info', 'Version: Latest');
      }

      // Download based on platform
      if (config.platform === 'windows') {
        await downloadWindows(versionPath, binaryType, config, addLog, setProgress);
      } else {
        await downloadMac(versionPath, binaryType, config, addLog);
      }

      addLog('success', 'Download complete!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Error: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  }, [addLog]);

  return {
    logs,
    progress,
    isDownloading,
    startDownload,
    clearLogs,
  };
}

async function downloadWindows(
  versionPath: string,
  binaryType: string,
  config: RDDConfig,
  addLog: (type: RDDLog['type'], message: string) => void,
  setProgress: (progress: { current: number; total: number }) => void
) {
  // Fetch manifest
  addLog('info', 'Fetching manifest from Roblox CDN...');
  const manifestUrl = `${versionPath}-rbxPkgManifest.txt`;
  const manifestResponse = await fetch(manifestUrl);

  if (!manifestResponse.ok) {
    throw new Error('Failed to fetch manifest. Version may not exist or network error occurred.');
  }

  const manifestText = await manifestResponse.text();
  const packages = manifestText.split('\n').filter(p => p.trim() && p.trim() !== 'v0');

  addLog('success', `Found ${packages.length} packages`);
  setProgress({ current: 0, total: packages.length });

  // Download and extract packages
  const finalZip = new JSZip();

  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i].trim();
    if (!packageName) continue;

    addLog('progress', `Downloading ${packageName}...`);
    const packageUrl = `${versionPath}-${packageName}`;

    try {
      const packageResponse = await fetch(packageUrl);
      if (!packageResponse.ok) {
        throw new Error(`Failed to fetch ${packageName}`);
      }

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Failed to process ${packageName}: ${errorMessage}`);
      throw error;
    }
  }

  // Generate final ZIP
  addLog('info', 'Assembling final deployment...');
  const finalBlob = await finalZip.generateAsync({
    type: 'blob',
    compression: config.compress ? 'DEFLATE' : 'STORE',
    compressionOptions: { level: 6 },
  }, (metadata) => {
    if (metadata.percent) {
      addLog('progress', `Assembling: ${Math.round(metadata.percent)}%`);
    }
  });

  // Trigger download
  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roblox-${binaryType}-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  addLog('success', 'File download started!');
}

async function downloadMac(
  versionPath: string,
  binaryType: string,
  config: RDDConfig,
  addLog: (type: RDDLog['type'], message: string) => void
) {
  // Mac is a single ZIP download
  const filename = binaryType === 'MacStudio' ? 'RobloxStudioApp.zip' : 'RobloxPlayer.zip';
  const url = `${versionPath}-${filename}`;

  addLog('info', `Downloading ${filename}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download Mac binary. Version may not exist or network error occurred.');
    }

    const blob = await response.blob();

    addLog('success', 'Download complete!');

    // Trigger download
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `roblox-${binaryType}-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    addLog('success', 'File download started!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLog('error', errorMessage);
    throw error;
  }
}
