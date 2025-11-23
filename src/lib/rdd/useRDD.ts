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

const extractRoots: Record<'player' | 'studio', Record<string, string>> = {
  player: {
    'RobloxApp.zip': '',
    'redist.zip': '',
    'shaders.zip': 'shaders/',
    'ssl.zip': 'ssl/',
    'WebView2.zip': '',
    'WebView2RuntimeInstaller.zip': 'WebView2RuntimeInstaller/',
    'content-avatar.zip': 'content/avatar/',
    'content-configs.zip': 'content/configs/',
    'content-fonts.zip': 'content/fonts/',
    'content-sky.zip': 'content/sky/',
    'content-sounds.zip': 'content/sounds/',
    'content-textures2.zip': 'content/textures/',
    'content-models.zip': 'content/models/',
    'content-platform-fonts.zip': 'PlatformContent/pc/fonts/',
    'content-platform-dictionaries.zip': 'PlatformContent/pc/shared_compression_dictionaries/',
    'content-terrain.zip': 'PlatformContent/pc/terrain/',
    'content-textures3.zip': 'PlatformContent/pc/textures/',
    'extracontent-luapackages.zip': 'ExtraContent/LuaPackages/',
    'extracontent-translations.zip': 'ExtraContent/translations/',
    'extracontent-models.zip': 'ExtraContent/models/',
    'extracontent-textures.zip': 'ExtraContent/textures/',
    'extracontent-places.zip': 'ExtraContent/places/',
  },
  studio: {
    'RobloxStudio.zip': '',
    'RibbonConfig.zip': 'RibbonConfig/',
    'redist.zip': '',
    'Libraries.zip': '',
    'LibrariesQt5.zip': '',
    'WebView2.zip': '',
    'WebView2RuntimeInstaller.zip': '',
    'shaders.zip': 'shaders/',
    'ssl.zip': 'ssl/',
    'Qml.zip': 'Qml/',
    'Plugins.zip': 'Plugins/',
    'StudioFonts.zip': 'StudioFonts/',
    'BuiltInPlugins.zip': 'BuiltInPlugins/',
    'ApplicationConfig.zip': 'ApplicationConfig/',
    'BuiltInStandalonePlugins.zip': 'BuiltInStandalonePlugins/',
    'content-qt_translations.zip': 'content/qt_translations/',
    'content-sky.zip': 'content/sky/',
    'content-fonts.zip': 'content/fonts/',
    'content-avatar.zip': 'content/avatar/',
    'content-models.zip': 'content/models/',
    'content-sounds.zip': 'content/sounds/',
    'content-configs.zip': 'content/configs/',
    'content-api-docs.zip': 'content/api_docs/',
    'content-textures2.zip': 'content/textures/',
    'content-studio_svg_textures.zip': 'content/studio_svg_textures/',
    'content-platform-fonts.zip': 'PlatformContent/pc/fonts/',
    'content-platform-dictionaries.zip': 'PlatformContent/pc/shared_compression_dictionaries/',
    'content-terrain.zip': 'PlatformContent/pc/terrain/',
    'content-textures3.zip': 'PlatformContent/pc/textures/',
    'extracontent-translations.zip': 'ExtraContent/translations/',
    'extracontent-luapackages.zip': 'ExtraContent/LuaPackages/',
    'extracontent-textures.zip': 'ExtraContent/textures/',
    'extracontent-scripts.zip': 'ExtraContent/scripts/',
    'extracontent-models.zip': 'ExtraContent/models/',
    'studiocontent-models.zip': 'StudioContent/models/',
    'studiocontent-textures.zip': 'StudioContent/textures/',
  },
};

const binaryTypeBlobDirs: Record<string, string> = {
  WindowsPlayer: '/',
  WindowsStudio64: '/',
  MacPlayer: '/mac/',
  MacStudio: '/mac/',
};

interface RDDPackage {
  name: string;
  hash?: string;
  size?: number;
  compressedSize?: number;
}

interface ManifestResponse {
  version: string;
  packages: RDDPackage[];
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
      addLog('info', `Channel: ${config.channel}`);
      addLog('info', config.version ? `Version: ${config.version}` : 'Version: Latest');

      const blobDir = binaryTypeBlobDirs[binaryType] || '/';

      const manifestResult = await fetchManifest(
        binaryType,
        config.channel,
        blobDir,
        config.version,
        config.platform === 'mac',
        addLog,
      );
      addLog('success', `Resolved version ${manifestResult.version}`);

      // Download based on platform
      if (config.platform === 'windows') {
        await downloadWindows(manifestResult.version, config.channel, binaryType, blobDir, config, manifestResult.packages, addLog, setProgress);
      } else {
        await downloadMac(manifestResult.version, config.channel, binaryType, blobDir, config, addLog);
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

async function fetchManifest(
  binaryType: string,
  channel: string,
  blobDir: string,
  version: string | undefined,
  skipManifest: boolean,
  addLog: (type: RDDLog['type'], message: string) => void,
): Promise<ManifestResponse> {
  const versionParam = version && version !== 'latest'
    ? version
    : 'latest';

  addLog('info', 'Fetching manifest from Roblox CDN via proxy...');
  const manifestUrl = `/api/rdd/manifest?${new URLSearchParams({
    platform: binaryType,
    channel,
    version: versionParam,
    blobDir,
    skipManifest: skipManifest ? 'true' : 'false',
  }).toString()}`;
  addLog('info', `Manifest URL: ${manifestUrl}`);

  const manifestResponse = await fetch(manifestUrl);

  if (!manifestResponse.ok) {
    let errorDetail = '';
    try {
      const errorJson = await manifestResponse.clone().json();
      errorDetail = (errorJson as { error?: string; detail?: string })?.detail
        || (errorJson as { error?: string; detail?: string })?.error
        || '';
    } catch {
      try {
        errorDetail = (await manifestResponse.clone().text()).trim();
      } catch {
        errorDetail = '';
      }
    }

    const statusDescription = manifestResponse.statusText || `Status ${manifestResponse.status}`;
    const detailSuffix = errorDetail ? ` - ${errorDetail}` : '';
    throw new Error(`Failed to fetch manifest. ${statusDescription}${detailSuffix}`);
  }

  const manifestJson = await manifestResponse.json() as ManifestResponse;

  if (!manifestJson?.version || !Array.isArray(manifestJson.packages)) {
    throw new Error('Manifest response was missing expected data.');
  }

  return manifestJson;
}

async function downloadWindows(
  version: string,
  channel: string,
  binaryType: string,
  blobDir: string,
  config: RDDConfig,
  packages: RDDPackage[],
  addLog: (type: RDDLog['type'], message: string) => void,
  setProgress: (progress: { current: number; total: number }) => void,
) {
  if (!packages.length) {
    throw new Error('Manifest did not return any packages.');
  }

  addLog('success', `Found ${packages.length} packages`);
  setProgress({ current: 0, total: packages.length });

  // Download and extract packages
  const finalZip = new JSZip();

  // Match the extraction layout used by dd.latte.to
  finalZip.file('AppSettings.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Settings>
\t<ContentFolder>content</ContentFolder>
\t<BaseUrl>http://www.roblox.com</BaseUrl>
</Settings>
`);

  const extractionRoots = config.target === 'studio' ? extractRoots.studio : extractRoots.player;

  if (config.target === 'player' && !packages.some(pkg => pkg.name === 'RobloxApp.zip')) {
    throw new Error('Expected RobloxApp.zip in manifest for WindowsPlayer.');
  }

  if (config.target === 'studio' && !packages.some(pkg => pkg.name === 'RobloxStudio.zip')) {
    throw new Error('Expected RobloxStudio.zip in manifest for WindowsStudio64.');
  }

  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i].name.trim();
    if (!packageName) continue;

    addLog('progress', `Downloading ${packageName}...`);
    const packageUrl = `/api/rdd/package?${new URLSearchParams({
      channel,
      version,
      file: packageName,
      blobDir,
    }).toString()}`;

    try {
      const packageResponse = await fetch(packageUrl);
      if (!packageResponse.ok) {
        throw new Error(`Failed to fetch ${packageName}`);
      }

      const packageData = await packageResponse.arrayBuffer();

      // Some manifest entries (e.g., RobloxPlayerInstaller.exe) are not ZIPs. Add them directly.
      const isZip = packageName.toLowerCase().endsWith('.zip');

      const targetRoot = extractionRoots[packageName];

      if (!isZip) {
        const destination = targetRoot ? `${targetRoot}${packageName}` : packageName;
        addLog('progress', `Adding ${packageName} to bundle...`);
        finalZip.file(destination, packageData);
      } else {
        addLog('progress', `Extracting ${packageName}...`);
        const packageZip = await JSZip.loadAsync(packageData);

        // Extract files to final ZIP using the expected root mapping
        for (const [filename, file] of Object.entries(packageZip.files)) {
          if (!file.dir) {
            const content = await file.async('arraybuffer');
            const normalizedPath = filename.replace(/\\/g, '/');
            const destination = targetRoot ? `${targetRoot}${normalizedPath}` : normalizedPath;
            finalZip.file(destination, content);
          }
        }

        if (!targetRoot) {
          addLog('info', `Package ${packageName} not mapped; kept original paths.`);
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
  const outputFileName = `${channel}-${binaryType}-${version}.zip`;
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
  a.download = outputFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  addLog('success', 'File download started!');
}

async function downloadMac(
  version: string,
  channel: string,
  binaryType: string,
  blobDir: string,
  config: RDDConfig,
  addLog: (type: RDDLog['type'], message: string) => void
) {
  // Mac is a single ZIP download
  const filename = binaryType === 'MacStudio' ? 'RobloxStudioApp.zip' : 'RobloxPlayer.zip';
  const url = `/api/rdd/package?${new URLSearchParams({
    channel,
    version,
    file: filename,
    blobDir,
  }).toString()}`;

  addLog('info', `Downloading ${filename}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download Mac binary. Version may not exist or network error occurred.');
    }

    const blob = await response.blob();

    addLog('success', 'Download complete!');

    // Trigger download
    const outputFileName = `${channel}-${binaryType}-${version}.zip`;
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = outputFileName;
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
