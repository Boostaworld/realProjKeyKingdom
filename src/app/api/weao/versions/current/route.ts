import { NextResponse } from "next/server";

const WEAO_VERSIONS_URL = "https://weao.gg/api/versions/current";

export async function GET() {
  try {
    const response = await fetch(WEAO_VERSIONS_URL, {
      headers: { "User-Agent": "WEAO-3PService" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 502) {
        console.error("WEAO upstream returned 502 for /versions/current");
      }
      throw new Error(`WEAO API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("WEAO API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from WEAO" },
      { status: 502 }
    );
  }
}
