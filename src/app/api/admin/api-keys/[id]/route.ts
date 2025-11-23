/**
 * Admin API: Single API Key Management
 *
 * DELETE /api/admin/api-keys/:id - Revoke API key
 * GET /api/admin/api-keys/:id - Get API key details
 */

import { NextRequest } from "next/server";
import {
  authenticateAdmin,
  createErrorResponse,
  createSuccessResponse,
  logAdminAction,
} from "@/lib/api/admin-auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/api-keys/:id
 * Get API key details (key is masked)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;

    // Find API key by ID
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return createErrorResponse("NOT_FOUND", "API key not found", 404);
    }

    // Return masked key
    return createSuccessResponse(
      {
        id: apiKey.id,
        name: apiKey.name,
        type: apiKey.type,
        keyPreview: `${apiKey.key.substring(0, 10)}...${apiKey.key.substring(apiKey.key.length - 4)}`,
        rateLimit: apiKey.rateLimit,
        rateLimitWindow: apiKey.rateLimitWindow,
        totalRequests: apiKey.totalRequests,
        lastUsedAt: apiKey.lastUsedAt,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
        revoked: apiKey.revoked,
        revokedAt: apiKey.revokedAt,
        revokedBy: apiKey.revokedBy,
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to fetch API key",
      500
    );
  }
}

/**
 * DELETE /api/admin/api-keys/:id
 * Revoke an API key (cannot be undone)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get("reason") || "Revoked by admin";

    // Find API key by ID
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return createErrorResponse("NOT_FOUND", "API key not found", 404);
    }

    if (apiKey.revoked) {
      return createErrorResponse(
        "ALREADY_REVOKED",
        "API key is already revoked",
        400
      );
    }

    // Revoke the API key
    const revokedKey = await prisma.apiKey.update({
      where: { id },
      data: {
        revoked: true,
        revokedAt: new Date(),
        revokedBy: auth.userId,
      },
    });

    // Log admin action
    await logAdminAction({
      action: "api_key.revoked",
      userId: auth.userId!,
      targetId: id,
      details: {
        name: apiKey.name,
        type: apiKey.type,
        reason,
        keyPreview: `${apiKey.key.substring(0, 10)}...${apiKey.key.substring(apiKey.key.length - 4)}`,
      },
    });

    return createSuccessResponse(
      {
        id: revokedKey.id,
        name: revokedKey.name,
        type: revokedKey.type,
        revokedAt: revokedKey.revokedAt,
        revokedBy: revokedKey.revokedBy,
        reason,
        message: "API key has been revoked successfully. It can no longer be used.",
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to revoke API key",
      500
    );
  }
}
