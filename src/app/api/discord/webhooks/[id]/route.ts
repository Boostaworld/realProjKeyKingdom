/**
 * Discord Bot API: DELETE /api/discord/webhooks/:id
 *
 * Delete a webhook subscription.
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import { deleteWebhook, getWebhook } from "@/lib/db/webhooks";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { id } = params;

    // Get webhook to verify ownership
    const webhook = await getWebhook(id);

    if (!webhook) {
      return createErrorResponse(
        "NOT_FOUND",
        `Webhook ${id} not found`,
        404
      );
    }

    // Verify ownership (webhook belongs to this API key)
    if (webhook.apiKeyId !== auth.apiKeyId) {
      return createErrorResponse(
        "FORBIDDEN",
        "You don't have permission to delete this webhook",
        403
      );
    }

    // Delete webhook
    await deleteWebhook(id);

    return createSuccessResponse(
      {
        id,
        deletedAt: new Date().toISOString(),
      },
      auth.rateLimitResult
    );
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to delete webhook",
      500
    );
  }
}
