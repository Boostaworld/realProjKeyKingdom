import { NextRequest, NextResponse } from 'next/server';

function buildCdnBase(channel: string) {
  return channel === 'LIVE'
    ? 'https://setup-aws.rbxcdn.com'
    : `https://setup-aws.rbxcdn.com/channel/${channel}`;
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const channel = searchParams.get('channel') || 'LIVE';
  const file = searchParams.get('file');
  const blobDir = normalizeBlobDir(searchParams.get('blobDir'));

  if (!version || !file) {
    return NextResponse.json(
      { error: 'Missing required parameters: version and file are required.' },
      { status: 400 },
    );
  }

  const cdnBase = buildCdnBase(channel);
  const packageUrl = `${cdnBase}${blobDir}${version}-${file}`;

  try {
    const response = await fetch(packageUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Roblox CDN returned ${response.status} for ${file}` },
        { status: 502 },
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${file}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('RDD package proxy error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch package from Roblox CDN', detail: message },
      { status: 502 },
    );
  }
}
