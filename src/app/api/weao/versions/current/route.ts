import { NextResponse } from "next/server";

const WEAO_VERSIONS_URL = "https://weao.gg/api/versions/current";

export async function GET() {
  try {
    const response = await fetch(WEAO_VERSIONS_URL, {
      headers: { "User-Agent": "WEAO-3PService" },
    });

    if (!response.ok) {
      throw new Error(`WEAO returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("WEAO error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 502 });
  }
}
