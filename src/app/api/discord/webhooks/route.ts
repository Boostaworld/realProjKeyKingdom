/**
 * Discord Bot API: Webhook Management
 *
 * GET /api/discord/webhooks - List webhooks
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import { listWebhooksByApiKey } from "@/lib/db/webhooks";

export async function GET(request: NextRequest) {
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
    // Get webhooks for this API key
    const webhooks = await listWebhooksByApiKey(auth.apiKeyId!);

    const formattedWebhooks = webhooks.map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      events: JSON.parse(webhook.events),
      active: webhook.active,
      createdAt: webhook.createdAt,
      lastTriggeredAt: webhook.lastTriggeredAt,
      stats: {
        totalDeliveries: webhook.totalDeliveries,
        successfulDeliveries: webhook.successfulDeliveries,
        failedDeliveries: webhook.failedDeliveries,
      },
    }));

    return createSuccessResponse(
      {
        webhooks: formattedWebhooks,
        total: webhooks.length,
      },
      auth.rateLimitResult
    );
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Failed to fetch webhooks",
      500
    );
  }
}
