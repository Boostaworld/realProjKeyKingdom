/**
 * Discord Bot API: GET /api/discord/platform-status
 *
 * Returns current Roblox version and platform health information.
 */

import { NextRequest } from "next/server";
import {
  authenticateDiscordBot,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/api/discord-auth";
import type { Executor } from "@/types/executor";

type PlatformName = "Windows" | "Mac" | "Mobile" | "Android";
type PlatformStatus = "stable" | "partial" | "broken";

interface PlatformHealthData {
  platform: PlatformName;
  status: PlatformStatus;
  version: string;
  lastChecked: string;
  workingExecutors: number;
  totalExecutors: number;
  message: string;
}

export async function GET(request: NextRequest) {
  // Authenticate the request
  const auth = await authenticateDiscordBot(request);

  if (!auth.authenticated) {
    return createErrorResponse(
      "UNAUTHORIZED",
      auth.error || "Authentication failed",
      401
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

    // Calculate platform health
    const platforms: PlatformHealthData[] = [];

    // Helper function to calculate platform health
    const calculatePlatformHealth = (
      platformName: PlatformName,
      platformKey: keyof Executor["platforms"]
    ): PlatformHealthData => {
      // Filter executors that support this platform
      const platformExecutors = executors.filter((e) => e.platforms[platformKey]);
      const workingExecutors = platformExecutors.filter((e) => e.status.working);

      const totalExecutors = platformExecutors.length;
      const workingCount = workingExecutors.length;
      const workingPercentage = totalExecutors > 0
        ? (workingCount / totalExecutors) * 100
        : 0;

      // Determine status
      let status: PlatformStatus;
      let message: string;

      if (workingPercentage >= 80) {
        status = "stable";
        message = `Most ${platformName} executors are working fine`;
      } else if (workingPercentage >= 40) {
        status = "partial";
        message = `Some ${platformName} executors experiencing issues`;
      } else {
        status = "broken";
        message = `Most ${platformName} executors are currently broken`;
      }

      // Get most recent Roblox version from working executors
      const mostRecentVersion = workingExecutors.length > 0
        ? workingExecutors.sort((a, b) =>
            new Date(b.status.lastChecked).getTime() -
            new Date(a.status.lastChecked).getTime()
          )[0].status.robloxVersion
        : "unknown";

      // Get most recent check time
      const mostRecentCheck = platformExecutors.length > 0
        ? platformExecutors.sort((a, b) =>
            new Date(b.status.lastChecked).getTime() -
            new Date(a.status.lastChecked).getTime()
          )[0].status.lastChecked
        : new Date();

      return {
        platform: platformName,
        status,
        version: mostRecentVersion,
        lastChecked: mostRecentCheck.toISOString(),
        workingExecutors: workingCount,
        totalExecutors,
        message,
      };
    };

    // Calculate health for each platform
    platforms.push(calculatePlatformHealth("Windows", "windows"));
    platforms.push(calculatePlatformHealth("Mac", "mac"));
    platforms.push(calculatePlatformHealth("Mobile", "mobile"));

    // Only add Android if there are Android-specific executors
    const androidExecutors = executors.filter((e) => e.platforms.android);
    if (androidExecutors.length > 0) {
      platforms.push(calculatePlatformHealth("Android", "android"));
    }

    const responseData = {
      platforms,
      lastUpdate: new Date().toISOString(),
    };

    return createSuccessResponse(responseData, auth.rateLimitResult);
  } catch (error) {
    console.error("Discord API error:", error);
    return createErrorResponse(
      "SERVER_ERROR",
      "Internal server error",
      500
    );
  }
}
