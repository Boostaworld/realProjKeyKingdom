import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const targetUrl = `https://setup.rbxcdn.com/${path}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);

    const contentType = response.headers.get("content-type");

    // Return as blob/stream
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
