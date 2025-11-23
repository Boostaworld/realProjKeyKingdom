/**
 * Rate Limiting Implementation
 *
 * Simple in-memory rate limiter for API endpoints.
 * In production, use Redis or similar for distributed rate limiting.
 */

export interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
// TODO: Replace with Redis in production for distributed systems
const rateLimitStore = new Map<string, RateLimitBucket>();

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., API key, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  // Create new bucket if it doesn't exist or has expired
  if (!bucket || bucket.resetAt < now) {
    const newBucket: RateLimitBucket = {
      count: 1,
      resetAt: now + config.window,
    };
    rateLimitStore.set(key, newBucket);

    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: newBucket.resetAt,
    };
  }

  // Check if limit exceeded
  if (bucket.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  // Increment counter
  bucket.count++;

  return {
    allowed: true,
    remaining: config.limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/**
 * Add rate limit headers to a response
 * @param headers - Headers object to add to
 * @param result - Rate limit result
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
  limit: number
): void {
  headers.set("X-RateLimit-Limit", limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set(
    "X-RateLimit-Reset",
    Math.floor(result.resetAt / 1000).toString()
  );
}

/**
 * Clean up expired buckets periodically
 * Call this in a background task
 */
export function cleanupExpiredBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired buckets every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredBuckets, 5 * 60 * 1000);
}
