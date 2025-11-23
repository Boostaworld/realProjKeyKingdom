/**
 * Webhook Retry Worker
 *
 * Background worker that retries failed webhook deliveries.
 * Run this as a cron job or background task.
 */

import { getPendingDeliveries, markDeliveryAsDelivered, markDeliveryAsFailed, updateWebhookStats, getWebhook } from "@/lib/db/webhooks";
import crypto from "crypto";

/**
 * Generate webhook signature
 */
function generateSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  return "sha256=" + hmac.update(payload).digest("hex");
}

/**
 * Retry a single webhook delivery
 */
async function retryDelivery(
  url: string,
  secret: string | null,
  payloadString: string
): Promise<{
  success: boolean;
  statusCode?: number;
  responseBody?: string;
}> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Key-Kingdom-Webhook/1.0 (Retry)",
    };

    if (secret) {
      headers["X-KeyKingdom-Signature"] = generateSignature(payloadString, secret);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000),
    });

    const responseBody = await response.text().catch(() => "");

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000),
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 0,
      responseBody: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process pending webhook deliveries
 *
 * This function should be called periodically (e.g., every minute)
 * to retry failed webhook deliveries.
 */
export async function processWebhookRetries(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  let processed = 0;
  let successful = 0;
  let failed = 0;

  try {
    // Get pending deliveries ready for retry
    const pendingDeliveries = await getPendingDeliveries(100);

    console.log(`Processing ${pendingDeliveries.length} pending webhook deliveries`);

    for (const delivery of pendingDeliveries) {
      processed++;

      // Get webhook details
      const webhook = delivery.webhook;

      if (!webhook || !webhook.active) {
        // Webhook deleted or deactivated, mark as failed
        await markDeliveryAsFailed(
          delivery.id,
          0,
          "Webhook deleted or deactivated",
          false
        );
        failed++;
        continue;
      }

      // Retry delivery
      const result = await retryDelivery(
        webhook.url,
        webhook.secret,
        delivery.payload
      );

      // Update delivery status
      if (result.success) {
        await markDeliveryAsDelivered(
          delivery.id,
          result.statusCode!,
          result.responseBody
        );
        await updateWebhookStats(webhook.id, true);
        successful++;
      } else {
        await markDeliveryAsFailed(
          delivery.id,
          result.statusCode,
          result.responseBody,
          true // Schedule another retry if not at max
        );
        await updateWebhookStats(webhook.id, false);
        failed++;
      }
    }

    console.log(
      `Webhook retry complete: ${processed} processed, ${successful} successful, ${failed} failed`
    );
  } catch (error) {
    console.error("Error processing webhook retries:", error);
  }

  return { processed, successful, failed };
}

/**
 * Start webhook retry worker
 *
 * Call this function to start a background worker that processes
 * webhook retries every minute.
 */
export function startWebhookRetryWorker(): void {
  console.log("Starting webhook retry worker...");

  // Process immediately
  processWebhookRetries().catch(console.error);

  // Process every minute
  setInterval(() => {
    processWebhookRetries().catch(console.error);
  }, 60 * 1000);
}

/**
 * Usage:
 *
 * // In your application startup (e.g., server.ts or app startup):
 * import { startWebhookRetryWorker } from "@/lib/webhooks/retry-worker";
 *
 * if (process.env.ENABLE_WEBHOOK_WORKER === "true") {
 *   startWebhookRetryWorker();
 * }
 *
 * // Or run as a separate process/cron job:
 * // node -e "require('./dist/lib/webhooks/retry-worker').processWebhookRetries()"
 */
