import { NextRequest, NextResponse } from 'next/server';

interface ManifestPackage {
  name: string;
  hash?: string;
  size?: number;
  compressedSize?: number;
}

async function resolveVersion(platform: string, channel: string, requestedVersion?: string) {
  // Respect explicit versions
  if (requestedVersion && requestedVersion !== 'latest') {
    return requestedVersion.startsWith('version-') ? requestedVersion : `version-${requestedVersion}`;
  }

  const versionEndpoint = channel === 'LIVE'
    ? `https://clientsettings.roblox.com/v1/client-version/${platform}`
    : `https://clientsettings.roblox.com/v1/client-version/${platform}/channel/${channel}`;

  const versionResponse = await fetch(versionEndpoint);

  if (!versionResponse.ok) {
    throw new Error(`Failed to resolve latest version: ${versionResponse.statusText || versionResponse.status}`);
  }

  const versionJson = await versionResponse.json() as { clientVersionUpload?: string; version?: string };
  const resolvedVersion = versionJson.clientVersionUpload || versionJson.version;

  if (!resolvedVersion) {
    throw new Error('Version response was missing clientVersionUpload');
  }

  return resolvedVersion.startsWith('version-') ? resolvedVersion : `version-${resolvedVersion}`;
}

function parseManifest(manifestText: string): ManifestPackage[] {
  const lines = manifestText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  // First entry is the manifest version marker (e.g., v0)
  if (lines[0]?.startsWith('v')) {
    lines.shift();
  }

  const packages: ManifestPackage[] = [];

  for (let i = 0; i < lines.length; i += 4) {
    const name = lines[i];
    if (!name) continue;

    const hash = lines[i + 1];
    const size = Number.parseInt(lines[i + 2] ?? '', 10);
    const compressedSize = Number.parseInt(lines[i + 3] ?? '', 10);

    packages.push({
      name,
      hash: hash || undefined,
      size: Number.isFinite(size) ? size : undefined,
      compressedSize: Number.isFinite(compressedSize) ? compressedSize : undefined,
    });
  }

  return packages;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'WindowsPlayer';
    const channel = searchParams.get('channel') || 'LIVE';
    const version = searchParams.get('version') || 'latest';

    const resolvedVersion = await resolveVersion(platform, channel, version);

    const baseUrl = channel === 'LIVE'
      ? 'https://setup.rbxcdn.com'
      : `https://setup.rbxcdn.com/channel/${channel}`;

    const manifestUrl = `${baseUrl}/${resolvedVersion}-rbxPkgManifest.txt`;
    const response = await fetch(manifestUrl);

    if (!response.ok) {
      throw new Error(`Roblox CDN returned ${response.status}`);
    }

    const manifestText = await response.text();
    const packages = parseManifest(manifestText);

    return NextResponse.json({
      version: resolvedVersion,
      packages,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('RDD proxy error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch from Roblox CDN',
        detail: errorMessage,
      },
      { status: 502 },
    );
  }
}
