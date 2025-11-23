/**
 * Admin API: Single Executor Management
 *
 * PATCH /api/admin/executors/:id - Update executor
 * DELETE /api/admin/executors/:id - Delete executor
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
 * PATCH /api/admin/executors/:id
 * Update an existing executor
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
    const updates = await request.json();

    // TODO: Fetch existing executor from database
    // const existing = await db.executors.findById(id);
    // if (!existing) {
    //   return createErrorResponse("NOT_FOUND", "Executor not found", 404);
    // }

    // TODO: Apply updates to executor
    // const updated = await db.executors.update(id, {
    //   ...updates,
    //   updatedAt: new Date().toISOString(),
    // });

    // Track changes for audit log
    const changes: Record<string, string> = {};
    // TODO: Compare existing vs updates and track changes
    // for (const key in updates) {
    //   if (existing[key] !== updates[key]) {
    //     changes[key] = `Changed from ${existing[key]} to ${updates[key]}`;
    //   }
    // }

    // Log admin action
    await logAdminAction({
      action: "executor.updated",
      userId: auth.userId!,
      executorId: id,
      changes,
    });

    return createSuccessResponse(
      {
        id,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.userId,
        changes,
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to update executor",
      500
    );
  }
}

/**
 * DELETE /api/admin/executors/:id
 * Delete an executor (soft delete by default)
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
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get("reason") || "No reason provided";
    const permanent = searchParams.get("permanent") === "true";

    // TODO: Delete or soft-delete from database
    // if (permanent) {
    //   await db.executors.hardDelete(id);
    // } else {
    //   await db.executors.softDelete(id, {
    //     deletedAt: new Date().toISOString(),
    //     deletedBy: auth.userId,
    //     deleteReason: reason,
    //   });
    // }

    // Log admin action
    await logAdminAction({
      action: "executor.deleted",
      userId: auth.userId!,
      executorId: id,
      details: { reason, permanent },
    });

    return createSuccessResponse(
      {
        id,
        deletedAt: new Date().toISOString(),
        deletedBy: auth.userId,
        reason,
        permanent,
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to delete executor",
      500
    );
  }
}
