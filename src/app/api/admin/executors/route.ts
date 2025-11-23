/**
 * Admin API: Executor Management
 *
 * POST /api/admin/executors - Create new executor
 * GET /api/admin/executors - List all executors (admin view)
 */

import { NextRequest } from "next/server";
import {
  authenticateAdmin,
  createErrorResponse,
  createSuccessResponse,
  logAdminAction,
} from "@/lib/api/admin-auth";
import type { Executor } from "@/types/executor";

/**
 * Generate a unique ID for an executor
 * In production, use a more robust ID generation strategy
 */
function generateExecutorId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `exec_${timestamp}_${random}`;
}

/**
 * POST /api/admin/executors
 * Create a new executor
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

    // Validate required fields
    const requiredFields = ["name", "slug", "category"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return createErrorResponse(
        "INVALID_INPUT",
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      );
    }

    // Create executor object
    const executor = {
      id: generateExecutorId(),
      slug: body.slug,
      name: body.name,
      description: body.description || "",
      longDescription: body.longDescription,
      logo: body.logo || "",
      images: body.images || [],
      suncRating: body.suncRating || 0,
      category: body.category,
      status: {
        working: false,
        robloxVersion: "unknown",
        lastChecked: new Date().toISOString(),
      },
      platforms: body.platforms || {
        windows: false,
        mac: false,
        mobile: false,
        android: false,
      },
      pricing: {
        type: body.pricing?.type || "free",
        price: body.pricing?.price,
        currency: body.pricing?.currency || "USD",
        purchaseUrl: body.pricing?.purchaseUrl || "",
        freeTrial: body.pricing?.freeTrial,
      },
      features: body.features || [],
      keyFeatures: body.keyFeatures || [],
      rating: {
        average: 0,
        count: 0,
      },
      links: body.links || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: auth.userId,
      verified: true,
      popular: false,
    };

    // TODO: Save to database
    // await db.executors.create(executor);

    // Log admin action
    await logAdminAction({
      action: "executor.created",
      userId: auth.userId!,
      executorId: executor.id,
      details: {
        name: executor.name,
        slug: executor.slug,
        category: executor.category,
      },
    });

    return createSuccessResponse(
      {
        id: executor.id,
        name: executor.name,
        slug: executor.slug,
        status: "created",
        createdAt: executor.createdAt,
        createdBy: executor.createdBy,
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create executor",
      500
    );
  }
}

/**
 * GET /api/admin/executors
 * List all executors (admin view with additional metadata)
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
    // Fetch all executors from internal API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const executorsResponse = await fetch(`${baseUrl}/api/executors`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!executorsResponse.ok) {
      throw new Error("Failed to fetch executors");
    }

    const executors: Executor[] = await executorsResponse.json();

    // Return full executor data (admin has access to everything)
    return createSuccessResponse(
      {
        executors,
        total: executors.length,
      },
      auth.rateLimitResult,
      500
    );
  } catch (error) {
    console.error("Admin API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Failed to fetch executors",
      500
    );
  }
}
