/**
 * Discord Bot API: POST /api/discord/webhooks/subscribe
 *
 * Subscribe to webhook events.
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import { createWebhook } from "@/lib/db/webhooks";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  // Authenticate
  const auth = await authenticateDiscordBot(request);

  if (!auth.authenticated) {
    return createErrorResponse(
      "UNAUTHORIZED",
      auth.error || "Authentication failed",
      401
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.url) {
      return createErrorResponse(
        "INVALID_INPUT",
        "Missing required field: url",
        400
      );
    }

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return createErrorResponse(
        "INVALID_INPUT",
        "Missing or invalid field: events (must be non-empty array)",
        400
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return createErrorResponse(
        "INVALID_INPUT",
        "Invalid URL format",
        400
      );
    }

    // Validate events
    const validEvents = [
      "executor.status_changed",
      "executor.added",
      "executor.updated",
      "executor.removed",
      "platform.status_changed",
      "*", // All events
    ];

    for (const event of body.events) {
      if (!validEvents.includes(event)) {
        return createErrorResponse(
          "INVALID_INPUT",
          `Invalid event type: ${event}. Valid events: ${validEvents.join(", ")}`,
          400
        );
      }
    }

    // Generate secret if not provided
    const secret = body.secret || crypto.randomBytes(32).toString("hex");

    // Create webhook
    const webhook = await createWebhook({
      url: body.url,
      events: body.events,
      secret,
      apiKeyId: auth.apiKeyId,
    });

    return createSuccessResponse(
      {
        webhookId: webhook.id,
        url: webhook.url,
        events: JSON.parse(webhook.events),
        secret: webhook.secret,
        createdAt: webhook.createdAt,
      },
      auth.rateLimitResult
    );
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create webhook",
      500
    );
  }
}
