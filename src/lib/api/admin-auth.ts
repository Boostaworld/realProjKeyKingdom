/**
 * Admin & Vendor API Authentication
 *
 * Handles authentication and authorization for admin and vendor API endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, addRateLimitHeaders } from "./rate-limit";

export type UserRole = "admin" | "vendor" | "user";

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  role?: UserRole;
  error?: string;
  rateLimitResult?: {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  };
}

/**
 * Verify a JWT token and extract user information
 * TODO: Implement actual JWT verification with a library like jose or jsonwebtoken
 * @param token - JWT token string
 * @returns User ID if valid, null otherwise
 */
async function verifyToken(token: string): Promise<string | null> {
  // TODO: Implement real JWT verification
  // For now, this is a placeholder that accepts any token
  // In production:
  // 1. Verify JWT signature with JWT_SECRET
  // 2. Check expiration
  // 3. Extract and return user ID from payload

  if (!token || token === "invalid") {
    return null;
  }

  // Placeholder: return a mock user ID
  // In production, extract this from the JWT payload
  return "user_" + token.substring(0, 8);
}

/**
 * Get user role from database
 * TODO: Implement actual database lookup
 * @param userId - User ID
 * @returns User role
 */
async function getUserRole(userId: string): Promise<UserRole> {
  // TODO: Implement database lookup
  // For now, check against environment variables for demo purposes

  const adminUsers = (process.env.ADMIN_USER_IDS || "").split(",");
  if (adminUsers.includes(userId)) {
    return "admin";
  }

  const vendorUsers = (process.env.VENDOR_USER_IDS || "").split(",");
  if (vendorUsers.includes(userId)) {
    return "vendor";
  }

  return "user";
}

/**
 * Authenticate an admin request
 * Requires both user authentication (JWT) and admin secret key
 * @param request - Next.js request object
 * @returns Authentication result
 */
export async function authenticateAdmin(
  request: NextRequest
): Promise<AuthResult> {
  // Check user authentication token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or invalid Authorization header",
    };
  }

  const token = authHeader.substring(7);
  const userId = await verifyToken(token);

  if (!userId) {
    return {
      authenticated: false,
      error: "Invalid or expired authentication token",
    };
  }

  // Check user role
  const userRole = await getUserRole(userId);

  if (userRole !== "admin") {
    return {
      authenticated: false,
      error: "Admin access required",
    };
  }

  // Check admin secret key
  const adminKey = request.headers.get("x-admin-key");
  const expectedAdminKey = process.env.ADMIN_SECRET_KEY;

  if (!expectedAdminKey) {
    console.error("ADMIN_SECRET_KEY not configured!");
    return {
      authenticated: false,
      error: "Admin authentication not configured",
    };
  }

  if (adminKey !== expectedAdminKey) {
    return {
      authenticated: false,
      error: "Invalid admin key",
    };
  }

  // Check rate limit (admins have higher limits)
  const rateLimitResult = await rateLimit(userId, {
    limit: 500, // 500 requests
    window: 60 * 60 * 1000, // per hour
  });

  if (!rateLimitResult.allowed) {
    return {
      authenticated: false,
      error: "Rate limit exceeded",
      rateLimitResult,
    };
  }

  return {
    authenticated: true,
    userId,
    role: userRole,
    rateLimitResult,
  };
}

/**
 * Authenticate a vendor request
 * Requires user authentication (JWT) and vendor role
 * @param request - Next.js request object
 * @returns Authentication result
 */
export async function authenticateVendor(
  request: NextRequest
): Promise<AuthResult> {
  // Check user authentication token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or invalid Authorization header",
    };
  }

  const token = authHeader.substring(7);
  const userId = await verifyToken(token);

  if (!userId) {
    return {
      authenticated: false,
      error: "Invalid or expired authentication token",
    };
  }

  // Check user role
  const userRole = await getUserRole(userId);

  if (userRole !== "vendor" && userRole !== "admin") {
    return {
      authenticated: false,
      error: "Vendor access required",
    };
  }

  // Check rate limit (vendors have moderate limits)
  const rateLimitResult = await rateLimit(userId, {
    limit: 200, // 200 requests
    window: 60 * 60 * 1000, // per hour
  });

  if (!rateLimitResult.allowed) {
    return {
      authenticated: false,
      error: "Rate limit exceeded",
      rateLimitResult,
    };
  }

  return {
    authenticated: true,
    userId,
    role: userRole,
    rateLimitResult,
  };
}

/**
 * Create a standardized error response
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code
 * @returns Next.js JSON response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

/**
 * Create a standardized success response with rate limit headers
 * @param data - Response data
 * @param rateLimitResult - Rate limit information
 * @param rateLimit - Rate limit value for headers
 * @returns Next.js JSON response
 */
export function createSuccessResponse(
  data: unknown,
  rateLimitResult?: {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  },
  rateLimit: number = 500
): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
  });

  // Add rate limit headers
  if (rateLimitResult) {
    addRateLimitHeaders(response.headers, rateLimitResult, rateLimit);
  }

  return response;
}

/**
 * Log admin action to audit log
 * @param action - Action details
 */
export async function logAdminAction(action: {
  action: string;
  userId: string;
  executorId?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const { logAdminAction: logToDb } = await import("@/lib/db/admin-actions");

  await logToDb({
    action: action.action,
    userId: action.userId,
    executorId: action.executorId,
    targetId: action.targetId,
    details: action.details,
    changes: action.changes,
    ipAddress: action.ipAddress,
    userAgent: action.userAgent,
  });

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[ADMIN ACTION]", JSON.stringify(action, null, 2));
  }
}
