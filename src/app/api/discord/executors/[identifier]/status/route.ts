/**
 * Discord Bot API: GET /api/discord/executors/:identifier/status
 *
 * Quick endpoint to check if an executor is working.
 * Returns minimal status information for fast responses.
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

    // Return minimal status information
    const statusData = {
      name: executor.name,
      working: executor.status.working,
      robloxVersion: executor.status.robloxVersion,
      lastChecked: executor.status.lastChecked.toISOString(),
      suncRating: executor.suncRating,
      category: executor.category,
      statusMessage: executor.status.working
        ? "Working"
        : "Not working",
    };

    return createSuccessResponse(statusData, auth.rateLimitResult);
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Internal server error",
      500
    );
  }
}
