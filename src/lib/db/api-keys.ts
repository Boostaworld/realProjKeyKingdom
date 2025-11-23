/**
 * API Key Database Helpers
 *
 * Functions for managing API keys in the database.
 */

import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Generate a new API key
 */
export function generateApiKey(prefix: string = "kk_discord"): string {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return `${prefix}_${randomBytes}`;
}

/**
 * Create a new API key in the database
 */
export async function createApiKey(data: {
  key: string;
  name?: string;
  type?: string;
  rateLimit?: number;
  rateLimitWindow?: number;
}) {
  const keyHash = hashApiKey(data.key);

  return await prisma.apiKey.create({
    data: {
      key: data.key, // Store plain key (for now, in production should only store hash)
      keyHash,
      name: data.name,
      type: data.type || "discord_bot",
      rateLimit: data.rateLimit || 100,
      rateLimitWindow: data.rateLimitWindow || 60000,
    },
  });
}

/**
 * Find API key by key string
 */
export async function findApiKeyByKey(key: string) {
  return await prisma.apiKey.findUnique({
    where: { key },
  });
}

/**
 * Validate an API key
 */
export async function validateApiKey(key: string): Promise<boolean> {
  const apiKey = await findApiKeyByKey(key);

  if (!apiKey) return false;
  if (apiKey.revoked) return false;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return false;

  return true;
}

/**
 * Update API key last used timestamp
 */
export async function updateApiKeyLastUsed(key: string) {
  await prisma.apiKey.update({
    where: { key },
    data: {
      lastUsedAt: new Date(),
      totalRequests: {
        increment: 1,
      },
    },
  });
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(key: string, revokedBy: string) {
  return await prisma.apiKey.update({
    where: { key },
    data: {
      revoked: true,
      revokedAt: new Date(),
      revokedBy,
    },
  });
}

/**
 * List all API keys
 */
export async function listApiKeys(filters?: {
  type?: string;
  revoked?: boolean;
}) {
  return await prisma.apiKey.findMany({
    where: {
      type: filters?.type,
      revoked: filters?.revoked,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
