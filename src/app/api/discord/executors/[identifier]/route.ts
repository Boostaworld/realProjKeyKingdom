/**
 * Discord Bot API: GET /api/discord/executors/:identifier
 *
 * Returns detailed information about a specific executor.
 * The identifier can be either the executor ID or slug.
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import type { Executor } from "@/types/executor";

interface RouteParams {
  params: {
    identifier: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const { identifier } = params;

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

    // Find executor by ID or slug
    const executor = executors.find(
      (e) => e.id === identifier || e.slug === identifier
    );

    if (!executor) {
      return createErrorResponse(
        "NOT_FOUND",
        `Executor '${identifier}' not found`,
        404
      );
    }

    // Format response with full details
    const formattedData = {
      id: executor.id,
      name: executor.name,
      slug: executor.slug,
      description: executor.description,
      longDescription: executor.longDescription,
      logo: executor.logo,
      images: executor.images,
      suncRating: executor.suncRating,
      category: executor.category,
      status: {
        working: executor.status.working,
        robloxVersion: executor.status.robloxVersion,
        lastChecked: executor.status.lastChecked.toISOString(),
        lastStatusChange: executor.status.lastStatusChange?.toISOString(),
      },
      platforms: executor.platforms,
      pricing: {
        type: executor.pricing.type,
        price: executor.pricing.price,
        currency: executor.pricing.currency,
        purchaseUrl: executor.pricing.purchaseUrl,
        freeTrial: executor.pricing.freeTrial,
        rawCostString: executor.pricing.rawCostString,
      },
      features: executor.features,
      keyFeatures: executor.keyFeatures,
      rating: executor.rating,
      links: executor.links,
      createdAt: executor.createdAt.toISOString(),
      updatedAt: executor.updatedAt.toISOString(),
      verified: executor.verified,
      popular: executor.popular,
    };

    return createSuccessResponse(formattedData, auth.rateLimitResult);
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Internal server error",
      500
    );
  }
}
