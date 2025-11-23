/**
 * Discord Bot API Authentication
 *
 * Handles authentication and authorization for Discord bot API endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, addRateLimitHeaders } from "./rate-limit";

export interface AuthResult {
  authenticated: boolean;
  apiKey?: string;
  error?: string;
  rateLimitResult?: {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  };
}

/**
 * Valid API keys stored in environment variables
 * In production, this should be stored in a database with hashing
 */
function getValidApiKeys(): Set<string> {
  const keys = new Set<string>();

  // Load API keys from environment variables
  const key1 = process.env.DISCORD_BOT_API_KEY_1;
  const key2 = process.env.DISCORD_BOT_API_KEY_2;
  const key3 = process.env.DISCORD_BOT_API_KEY_3;

  if (key1) keys.add(key1);
  if (key2) keys.add(key2);
  if (key3) keys.add(key3);

  return keys;
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

  // Validate API key
  const validApiKeys = getValidApiKeys();

  if (validApiKeys.size === 0) {
    console.error("No Discord Bot API keys configured!");
    return {
      authenticated: false,
      error: "API authentication not configured",
    };
  }

  if (!validApiKeys.has(apiKey)) {
    return {
      authenticated: false,
      error: "Invalid API key",
    };
  }

  // Check rate limit
  const rateLimitResult = await rateLimit(apiKey, {
    limit: 100, // 100 requests
    window: 60 * 1000, // per minute
  });

  if (!rateLimitResult.allowed) {
    return {
      authenticated: false,
      error: "Rate limit exceeded. Please try again later.",
      rateLimitResult,
    };
  }

  return {
    authenticated: true,
    apiKey,
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
