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
    const normalized = requestedVersion.startsWith('version-') ? requestedVersion : `version-${requestedVersion}`;
    console.log(`[RDD] Using explicit version: ${normalized}`);
    return normalized;
  }

  // Try v2 endpoint first (more reliable)
  const v2Endpoint = channel === 'LIVE'
    ? `https://clientsettings.roblox.com/v2/client-version/${platform}`
    : `https://clientsettings.roblox.com/v2/client-version/${platform}/channel/${channel}`;

  console.log(`[RDD] Resolving version for ${platform} on ${channel} channel via ${v2Endpoint}`);

  try {
    const versionResponse = await fetch(v2Endpoint);

    if (versionResponse.ok) {
      const versionJson = await versionResponse.json() as { clientVersionUpload?: string; version?: string };
      const resolvedVersion = versionJson.clientVersionUpload || versionJson.version;

      if (resolvedVersion) {
        const normalized = resolvedVersion.startsWith('version-') ? resolvedVersion : `version-${resolvedVersion}`;
        console.log(`[RDD] Resolved version: ${normalized}`);
        return normalized;
      }
    }

    console.warn(`[RDD] v2 endpoint failed with ${versionResponse.status}, trying v1`);
  } catch (err) {
    console.warn(`[RDD] v2 endpoint error:`, err);
  }

  // Fallback to v1 endpoint
  const v1Endpoint = channel === 'LIVE'
    ? `https://clientsettings.roblox.com/v1/client-version/${platform}`
    : `https://clientsettings.roblox.com/v1/client-version/${platform}/channel/${channel}`;

  const versionResponse = await fetch(v1Endpoint);

  if (!versionResponse.ok) {
    throw new Error(`Failed to resolve latest version from both v2 and v1 endpoints: ${versionResponse.statusText || versionResponse.status}`);
  }

  const versionJson = await versionResponse.json() as { clientVersionUpload?: string; version?: string };
  const resolvedVersion = versionJson.clientVersionUpload || versionJson.version;

  if (!resolvedVersion) {
    throw new Error('Version response was missing clientVersionUpload from both v2 and v1 endpoints');
  }

  const normalized = resolvedVersion.startsWith('version-') ? resolvedVersion : `version-${resolvedVersion}`;
  console.log(`[RDD] Resolved version from v1: ${normalized}`);
  return normalized;
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

function normalizeBlobDir(blobDirParam: string | null) {
  if (!blobDirParam) return '/';

  let blobDir = blobDirParam;
  if (!blobDir.startsWith('/')) {
    blobDir = `/${blobDir}`;
  }

  if (!blobDir.endsWith('/')) {
    blobDir = `${blobDir}/`;
  }

  return blobDir;
}

async function fetchManifestText(manifestUrl: string, fallbackUrl?: string) {
  const response = await fetch(manifestUrl);

  if (response.ok) {
    return response.text();
  }

  if (fallbackUrl) {
    const fallbackResponse = await fetch(fallbackUrl);

    if (fallbackResponse.ok) {
      return fallbackResponse.text();
    }

    throw new Error(`Roblox CDN returned ${fallbackResponse.status} (fallback) and ${response.status}`);
  }

  throw new Error(`Roblox CDN returned ${response.status}`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'WindowsPlayer';
    const channel = searchParams.get('channel') || 'LIVE';
    const version = searchParams.get('version') || 'latest';
    const blobDir = normalizeBlobDir(searchParams.get('blobDir'));
    const skipManifest = searchParams.get('skipManifest') === 'true';

    const resolvedVersion = await resolveVersion(platform, channel, version);

    if (skipManifest) {
      return NextResponse.json({ version: resolvedVersion, packages: [] });
    }

    const cdnBase = channel === 'LIVE'
      ? 'https://setup-aws.rbxcdn.com'
      : `https://setup-aws.rbxcdn.com/channel/${channel}`;

    const manifestUrl = `${cdnBase}${blobDir}${resolvedVersion}-rbxPkgManifest.txt`;
    const fallbackUrl = channel !== 'LIVE'
      ? `https://setup-aws.rbxcdn.com/channel/common${blobDir}${resolvedVersion}-rbxPkgManifest.txt`
      : undefined;

    const manifestText = await fetchManifestText(manifestUrl, fallbackUrl);
    const packages = parseManifest(manifestText);

    return NextResponse.json({
      version: resolvedVersion,
      packages,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[RDD] Manifest proxy error:', {
      platform,
      channel,
      version,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch from Roblox CDN',
        detail: errorMessage,
      },
      { status: 502 },
    );
  }
}
