/**
 * Admin API: API Key Management
 *
 * POST /api/admin/api-keys - Generate new API key
 * GET /api/admin/api-keys - List all API keys
 */

import { NextRequest } from "next/server";
import {
  authenticateAdmin,
  createErrorResponse,
  createSuccessResponse,
  logAdminAction,
} from "@/lib/api/admin-auth";
import {
  createApiKey,
  generateApiKey,
  listApiKeys,
} from "@/lib/db/api-keys";

/**
 * POST /api/admin/api-keys
 * Generate a new API key
 */
export async function POST(request: NextRequest) {
  // Authenticate admin
  const auth = await authenticateAdmin(request);

  if (!auth.authenticated || auth.role !== "admin") {
    return createErrorResponse(
      "UNAUTHORIZED",
      auth.error || "Admin access required",
      403
    );
  }

  try {
    const body = await request.json();

    // Validate type
    const validTypes = ["discord_bot", "admin"];
    const type = body.type || "discord_bot";

    if (!validTypes.includes(type)) {
      return createErrorResponse(
        "INVALID_INPUT",
        `Invalid API key type. Must be one of: ${validTypes.join(", ")}`,
        400
      );
    }

    // Generate API key with appropriate prefix
    const prefix = type === "discord_bot" ? "kk_discord" : "kk_admin";
    const key = generateApiKey(prefix);

    // Create API key in database
    const apiKey = await createApiKey({
      key,
      name: body.name || `${type} key`,
      type,
      rateLimit: body.rateLimit || (type === "discord_bot" ? 100 : 500),
      rateLimitWindow: body.rateLimitWindow || (type === "discord_bot" ? 60000 : 3600000),
    });

    // Log admin action
    await logAdminAction({
      action: "api_key.created",
      userId: auth.userId!,
      targetId: apiKey.id,
      details: {
        name: apiKey.name,
        type: apiKey.type,
        rateLimit: apiKey.rateLimit,
        rateLimitWindow: apiKey.rateLimitWindow,
      },
    });

    // Return the key (only time it will be shown!)
    return createSuccessResponse(
      {
        id: apiKey.id,
        key: apiKey.key, // IMPORTANT: Only shown once at creation
        name: apiKey.name,
        type: apiKey.type,
        rateLimit: apiKey.rateLimit,
        rateLimitWindow: apiKey.rateLimitWindow,
        createdAt: apiKey.createdAt,
        message: "API key created successfully. Save this key securely - it won't be shown again!",
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create API key",
      500
    );
  }
}

/**
 * GET /api/admin/api-keys
 * List all API keys (keys are masked for security)
 */
export async function GET(request: NextRequest) {
  // Authenticate admin
  const auth = await authenticateAdmin(request);

  if (!auth.authenticated || auth.role !== "admin") {
    return createErrorResponse(
      "UNAUTHORIZED",
      auth.error || "Admin access required",
      403
    );
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const revoked = searchParams.get("revoked") === "true" ? true : searchParams.get("revoked") === "false" ? false : undefined;

    // Fetch API keys from database
    const apiKeys = await listApiKeys({
      type,
      revoked,
    });

    // Mask keys for security (only show first 10 and last 4 characters)
    const maskedKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      type: key.type,
      keyPreview: `${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 4)}`,
      rateLimit: key.rateLimit,
      rateLimitWindow: key.rateLimitWindow,
      totalRequests: key.totalRequests,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      revoked: key.revoked,
      revokedAt: key.revokedAt,
      revokedBy: key.revokedBy,
    }));

    return createSuccessResponse(
      {
        apiKeys: maskedKeys,
        total: maskedKeys.length,
        filters: {
          type,
          revoked,
        },
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Failed to fetch API keys",
      500
    );
  }
}
