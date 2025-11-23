/**
 * Webhook Trigger System
 *
 * Functions for triggering webhook deliveries when events occur.
 */

import { getWebhooksByEvent, createWebhookDelivery, markDeliveryAsDelivered, markDeliveryAsFailed, updateWebhookStats } from "@/lib/db/webhooks";
import crypto from "crypto";

export type WebhookEventType =
  | "executor.status_changed"
  | "executor.added"
  | "executor.updated"
  | "executor.removed"
  | "platform.status_changed";

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Generate webhook signature for verification
 */
function generateSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  return "sha256=" + hmac.update(payload).digest("hex");
}

/**
 * Deliver webhook to a single URL
 */
async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string | null,
  payload: WebhookPayload
): Promise<{
  success: boolean;
  statusCode?: number;
  responseBody?: string;
}> {
  try {
    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Key-Kingdom-Webhook/1.0",
    };

    // Add signature if secret exists
    if (secret) {
      headers["X-KeyKingdom-Signature"] = generateSignature(payloadString, secret);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseBody = await response.text().catch(() => "");

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000), // Limit response body size
    };
  } catch (error) {
    console.error(`Webhook delivery failed for ${webhookId}:`, error);
    return {
      success: false,
      statusCode: 0,
      responseBody: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Trigger webhooks for a specific event
 *
 * This function:
 * 1. Finds all webhooks subscribed to the event
 * 2. Creates delivery records
 * 3. Attempts delivery
 * 4. Updates delivery status
 */
export async function triggerWebhooks(
  eventType: WebhookEventType,
  eventData: Record<string, unknown>
): Promise<void> {
  try {
    // Get all webhooks subscribed to this event
    const webhooks = await getWebhooksByEvent(eventType);

    if (webhooks.length === 0) {
      console.log(`No webhooks subscribed to ${eventType}`);
      return;
    }

    console.log(`Triggering ${webhooks.length} webhooks for ${eventType}`);

    // Create payload
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: eventData,
    };

    // Process webhooks in parallel
    const deliveryPromises = webhooks.map(async (webhook) => {
      // Create delivery record
      const delivery = await createWebhookDelivery({
        webhookId: webhook.id,
        eventType,
        payload,
      });

      // Attempt delivery
      const result = await deliverWebhook(
        webhook.id,
        webhook.url,
        webhook.secret,
        payload
      );

      // Update delivery status
      if (result.success) {
        await markDeliveryAsDelivered(
          delivery.id,
          result.statusCode!,
          result.responseBody
        );
        await updateWebhookStats(webhook.id, true);
      } else {
        await markDeliveryAsFailed(
          delivery.id,
          result.statusCode,
          result.responseBody,
          true // Schedule retry
        );
        await updateWebhookStats(webhook.id, false);
      }

      return { webhookId: webhook.id, success: result.success };
    });

    const results = await Promise.all(deliveryPromises);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(
      `Webhook delivery complete: ${successful} successful, ${failed} failed`
    );
  } catch (error) {
    console.error("Error triggering webhooks:", error);
  }
}

/**
 * Example usage in your code:
 *
 * // When an executor status changes
 * await triggerWebhooks("executor.status_changed", {
 *   executor: {
 *     id: "exec_123",
 *     name: "Solara",
 *     slug: "solara"
 *   },
 *   previousStatus: {
 *     working: true,
 *     robloxVersion: "version-abc"
 *   },
 *   currentStatus: {
 *     working: false,
 *     robloxVersion: "version-abc"
 *   },
 *   changedAt: new Date().toISOString()
 * });
 */
