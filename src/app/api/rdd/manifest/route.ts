import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || 'WindowsPlayer';
  const channel = searchParams.get('channel') || 'LIVE';
  const version = searchParams.get('version') || 'latest';

  // Build Roblox CDN URL
  const baseUrl = channel === 'LIVE'
    ? 'https://setup.rbxcdn.com'
    : `https://setup.rbxcdn.com/channel/${channel}`;
  const cdnUrl = `${baseUrl}/${version}-${platform}`;

  try {
    const response = await fetch(cdnUrl);

    if (!response.ok) {
      throw new Error(`Roblox CDN returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? 'text/plain';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, {
        headers: { 'content-type': contentType },
      });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: 200,
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
