/**
 * Admin API: Manual Status Override
 *
 * PATCH /api/admin/executors/:id/status - Override executor status
 */

import { NextRequest } from "next/server";
import {
  authenticateAdmin,
  createErrorResponse,
  createSuccessResponse,
  logAdminAction,
} from "@/lib/api/admin-auth";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/admin/executors/:id/status
 * Manually override executor status (bypasses WEAO data)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (typeof body.working !== "boolean") {
      return createErrorResponse(
        "INVALID_INPUT",
        "Missing required field: working (boolean)",
        400
      );
    }

    // TODO: Update executor status in database
    // await db.executors.update(id, {
    //   status: {
    //     working: body.working,
    //     overridden: true,
    //     overrideReason: body.reason,
    //     overrideExpiresAt: body.expiresAt,
    //     overrideBy: auth.userId,
    //     lastChecked: new Date().toISOString(),
    //   },
    //   updatedAt: new Date().toISOString(),
    // });

    // Trigger webhooks if requested
    if (body.notifyWebhooks) {
      // TODO: Trigger webhook notifications
      // await triggerWebhooks("executor.status_changed", {
      //   executorId: id,
      //   previousStatus: existing.status,
      //   currentStatus: { working: body.working },
      //   reason: body.reason,
      // });
    }

    // Log admin action
    await logAdminAction({
      action: "executor.status_override",
      userId: auth.userId!,
      executorId: id,
      details: {
        working: body.working,
        reason: body.reason,
        expiresAt: body.expiresAt,
        notifyWebhooks: body.notifyWebhooks,
      },
    });

    return createSuccessResponse(
      {
        id,
        status: {
          working: body.working,
          overridden: true,
          overrideReason: body.reason,
          overrideExpiresAt: body.expiresAt,
          overrideBy: auth.userId,
          lastChecked: new Date().toISOString(),
        },
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to override status",
      500
    );
  }
}
