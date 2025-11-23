import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'WindowsPlayer';
    const channel = searchParams.get('channel') || 'LIVE';
    const version = searchParams.get('version') || 'latest';

    // Basic proxy to Roblox CDN
    const baseUrl = channel === 'LIVE'
      ? 'https://setup.rbxcdn.com'
      : `https://setup.rbxcdn.com/channel/${channel}`;
    const cdnUrl = `${baseUrl}/version-${version}-${platform}`;

    const response = await fetch(cdnUrl);

    if (!response.ok) {
      throw new Error(`CDN returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: { 'content-type': contentType },
    });
  } catch (error) {
    console.error('RDD proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Roblox CDN' },
      { status: 502 },
    );
  }
}
