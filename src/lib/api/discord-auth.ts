/**
 * Discord Bot API Authentication
 *
 * Handles authentication and authorization for Discord bot API endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, addRateLimitHeaders } from "./rate-limit";
import { validateApiKey, updateApiKeyLastUsed, findApiKeyByKey } from "@/lib/db/api-keys";

export interface AuthResult {
  authenticated: boolean;
  apiKey?: string;
  apiKeyId?: string;
  error?: string;
  rateLimitResult?: {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  };
}

/**
 * Authenticate a Discord bot API request
 * @param request - Next.js request object
 * @returns Authentication result with status and metadata
 */
export async function authenticateDiscordBot(
  request: NextRequest
): Promise<AuthResult> {
  // Check for Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      authenticated: false,
      error: "Missing Authorization header",
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Invalid Authorization header format. Use: Bearer <api_key>",
    };
  }

  // Extract API key
  const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

  if (!apiKey || apiKey.trim() === "") {
    return {
      authenticated: false,
      error: "API key is empty",
    };
  }

  // Validate API key against database
  const isValid = await validateApiKey(apiKey);

  if (!isValid) {
    return {
      authenticated: false,
      error: "Invalid or expired API key",
    };
  }

  // Get API key details from database
  const apiKeyRecord = await findApiKeyByKey(apiKey);

  if (!apiKeyRecord) {
    return {
      authenticated: false,
      error: "API key not found",
    };
  }

  // Check rate limit using the key's configured limits
  const rateLimitResult = await rateLimit(apiKey, {
    limit: apiKeyRecord.rateLimit,
    window: apiKeyRecord.rateLimitWindow,
  });

  if (!rateLimitResult.allowed) {
    return {
      authenticated: false,
      error: "Rate limit exceeded. Please try again later.",
      rateLimitResult,
    };
  }

  // Update last used timestamp (async, don't wait)
  updateApiKeyLastUsed(apiKey).catch((err) => {
    console.error("Failed to update API key last used:", err);
  });

  return {
    authenticated: true,
    apiKey,
    apiKeyId: apiKeyRecord.id,
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
 * @returns Next.js JSON response
 */
export function createSuccessResponse(
  data: unknown,
  rateLimitResult?: {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }
): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
  });

  // Add rate limit headers
  if (rateLimitResult) {
    addRateLimitHeaders(response.headers, rateLimitResult, 100);
  }

  return response;
}
