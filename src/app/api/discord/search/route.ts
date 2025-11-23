/**
 * Discord Bot API: GET /api/discord/search
 *
 * Search executors by name or features.
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import type { Executor } from "@/types/executor";

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
    const query = searchParams.get("q");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10"),
      25
    );

    if (!query) {
      return createErrorResponse(
        "INVALID_INPUT",
        "Missing required parameter: q (query)",
        400
      );
    }

    // Fetch all executors from internal API
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

    const executors: Executor[] = await executorsResponse.json();

    // Search logic
    const searchTerm = query.toLowerCase().trim();
    const matchedExecutors = executors.filter((executor) => {
      // Search in name
      if (executor.name.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in description
      if (executor.description.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in features
      if (executor.features.some((f) => f.toLowerCase().includes(searchTerm))) {
        return true;
      }

      // Search in key features
      if (executor.keyFeatures?.some((f) => f.toLowerCase().includes(searchTerm))) {
        return true;
      }

      return false;
    });

    // Sort by relevance (name matches first, then description, then features)
    const sortedResults = matchedExecutors.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchTerm);
      const bNameMatch = b.name.toLowerCase().includes(searchTerm);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      // If both or neither match name, sort by sUNC
      return b.suncRating - a.suncRating;
    });

    // Limit results
    const limitedResults = sortedResults.slice(0, limit);

    // Format response
    const formattedData = limitedResults.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      suncRating: e.suncRating,
      category: e.category,
      status: {
        working: e.status.working,
      },
      pricing: {
        type: e.pricing.type,
        price: e.pricing.price,
      },
      rating: e.rating,
    }));

    const responseData = {
      results: formattedData,
      meta: {
        query,
        total: matchedExecutors.length,
        returned: limitedResults.length,
      },
    };

    return createSuccessResponse(responseData, auth.rateLimitResult);
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Internal server error",
      500
    );
  }
}
