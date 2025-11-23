/**
 * Webhook Database Helpers
 *
 * Functions for managing webhooks and webhook deliveries.
 */

import { prisma } from "@/lib/db";

// ============================================
// Webhooks
// ============================================

export interface CreateWebhookParams {
  url: string;
  events: string[];
  secret?: string;
  apiKeyId?: string;
}

/**
 * Create a new webhook subscription
 */
export async function createWebhook(params: CreateWebhookParams) {
  return await prisma.webhook.create({
    data: {
      url: params.url,
      events: JSON.stringify(params.events),
      secret: params.secret,
      apiKeyId: params.apiKeyId,
    },
  });
}

/**
 * Get webhook by ID
 */
export async function getWebhook(id: string) {
  return await prisma.webhook.findUnique({
    where: { id },
  });
}

/**
 * List all active webhooks
 */
export async function listActiveWebhooks() {
  return await prisma.webhook.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * List webhooks for an API key
 */
export async function listWebhooksByApiKey(apiKeyId: string) {
  return await prisma.webhook.findMany({
    where: { apiKeyId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get webhooks subscribed to a specific event
 */
export async function getWebhooksByEvent(eventType: string) {
  const allWebhooks = await prisma.webhook.findMany({
    where: { active: true },
  });

  // Filter by event type (events is stored as JSON string)
  return allWebhooks.filter((webhook) => {
    try {
      const events = JSON.parse(webhook.events);
      return events.includes(eventType) || events.includes("*");
    } catch {
      return false;
    }
  });
}

/**
 * Update webhook
 */
export async function updateWebhook(
  id: string,
  data: {
    url?: string;
    events?: string[];
    active?: boolean;
  }
) {
  return await prisma.webhook.update({
    where: { id },
    data: {
      url: data.url,
      events: data.events ? JSON.stringify(data.events) : undefined,
      active: data.active,
      updatedAt: new Date(),
    },
  });
}

/**
 * Delete webhook
 */
export async function deleteWebhook(id: string) {
  return await prisma.webhook.delete({
    where: { id },
  });
}

/**
 * Update webhook stats after delivery attempt
 */
export async function updateWebhookStats(
  id: string,
  success: boolean
) {
  return await prisma.webhook.update({
    where: { id },
    data: {
      totalDeliveries: { increment: 1 },
      successfulDeliveries: success ? { increment: 1 } : undefined,
      failedDeliveries: success ? undefined : { increment: 1 },
      lastTriggeredAt: new Date(),
    },
  });
}

// ============================================
// Webhook Deliveries
// ============================================

export interface CreateWebhookDeliveryParams {
  webhookId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

/**
 * Create a webhook delivery record
 */
export async function createWebhookDelivery(params: CreateWebhookDeliveryParams) {
  return await prisma.webhookDelivery.create({
    data: {
      webhookId: params.webhookId,
      eventType: params.eventType,
      payload: JSON.stringify(params.payload),
      status: "pending",
    },
  });
}

/**
 * Mark delivery as delivered
 */
export async function markDeliveryAsDelivered(
  id: string,
  responseStatus: number,
  responseBody?: string
) {
  return await prisma.webhookDelivery.update({
    where: { id },
    data: {
      status: "delivered",
      deliveredAt: new Date(),
      responseStatus,
      responseBody,
    },
  });
}

/**
 * Mark delivery as failed
 */
export async function markDeliveryAsFailed(
  id: string,
  responseStatus?: number,
  responseBody?: string,
  scheduleRetry: boolean = true
) {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id },
  });

  if (!delivery) return null;

  const retries = delivery.retries + 1;
  const shouldRetry = scheduleRetry && retries < delivery.maxRetries;

  return await prisma.webhookDelivery.update({
    where: { id },
    data: {
      status: shouldRetry ? "pending" : "failed",
      retries,
      responseStatus,
      responseBody,
      nextRetryAt: shouldRetry
        ? new Date(Date.now() + Math.pow(2, retries) * 60000) // Exponential backoff
        : undefined,
    },
  });
}

/**
 * Get pending deliveries ready for retry
 */
export async function getPendingDeliveries(limit: number = 100) {
  return await prisma.webhookDelivery.findMany({
    where: {
      status: "pending",
      OR: [
        { nextRetryAt: null },
        { nextRetryAt: { lte: new Date() } },
      ],
    },
    include: {
      webhook: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });
}

/**
 * Get delivery history for a webhook
 */
export async function getWebhookDeliveryHistory(
  webhookId: string,
  limit: number = 50
) {
  return await prisma.webhookDelivery.findMany({
    where: { webhookId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get delivery statistics
 */
export async function getDeliveryStats(webhookId?: string) {
  const where = webhookId ? { webhookId } : {};

  const [total, delivered, failed, pending] = await Promise.all([
    prisma.webhookDelivery.count({ where }),
    prisma.webhookDelivery.count({ where: { ...where, status: "delivered" } }),
    prisma.webhookDelivery.count({ where: { ...where, status: "failed" } }),
    prisma.webhookDelivery.count({ where: { ...where, status: "pending" } }),
  ]);

  return {
    total,
    delivered,
    failed,
    pending,
    successRate: total > 0 ? (delivered / total) * 100 : 0,
  };
}
