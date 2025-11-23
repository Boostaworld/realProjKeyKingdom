/**
 * Discord Bot API: GET /api/discord/executors
 *
 * Returns a list of all executors with optional filtering.
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import type { Executor } from "@/types/executor";
import { sortExecutorsBySUNC } from "@/lib/hooks/useExecutors";

export async function GET(request: NextRequest) {
  // Authenticate the request
  const auth = await authenticateDiscordBot(request);

  if (!auth.authenticated) {
    return createErrorResponse(
      "UNAUTHORIZED",
      auth.error || "Authentication failed",
      401
    );
  }

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "all";
    const platform = searchParams.get("platform");
    const working = searchParams.get("working");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100
    );
    const sort = searchParams.get("sort") || "sunc";

    // Fetch executors from internal API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const executorsResponse = await fetch(`${baseUrl}/api/executors`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!executorsResponse.ok) {
      throw new Error("Failed to fetch executors");
    }

    let executors: Executor[] = await executorsResponse.json();

    // Apply filters
    if (category !== "all") {
      executors = executors.filter(
        (e) => e.category === category
      );
    }

    if (platform) {
      const platformKey = platform.toLowerCase() as keyof typeof executors[0]["platforms"];
      executors = executors.filter(
        (e) => e.platforms[platformKey] === true
      );
    }

    if (working !== null && working !== undefined) {
      const isWorking = working === "true";
      executors = executors.filter(
        (e) => e.status.working === isWorking
      );
    }

    // Sort
    if (sort === "sunc") {
      executors = sortExecutorsBySUNC(executors);
    } else if (sort === "name") {
      executors.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "updated") {
      executors.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    // Store total before limiting
    const total = executors.length;

    // Limit results
    executors = executors.slice(0, limit);

    // Format response
    const formattedData = executors.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      suncRating: e.suncRating,
      category: e.category,
      status: {
        working: e.status.working,
        robloxVersion: e.status.robloxVersion,
        lastChecked: e.status.lastChecked.toISOString(),
        lastStatusChange: e.status.lastStatusChange?.toISOString(),
      },
      platforms: e.platforms,
      pricing: {
        type: e.pricing.type,
        price: e.pricing.price,
        currency: e.pricing.currency,
      },
      rating: e.rating,
      links: e.links,
    }));

    return createSuccessResponse(
      {
        executors: formattedData,
        meta: {
          total,
          limit,
          offset: 0,
          hasMore: total > limit,
        },
      },
      auth.rateLimitResult
    );
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Internal server error",
      500
    );
  }
}
