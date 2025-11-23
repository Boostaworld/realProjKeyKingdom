/**
 * Version resolution for RDD
 *
 * Resolves the latest Roblox version hash from WEAO or Roblox clientsettings API.
 * This is used in "auto mode" to get the current version before delegating to Latte's RDD.
 */

import { RddBinaryType } from "./buildRddUrl";

/**
 * Resolve the latest version for a given binary type and channel
 *
 * Flow:
 * 1. Try WEAO API (via our proxy) first
 * 2. Fall back to Roblox clientsettings API if WEAO fails
 * 3. Return normalized version hash (with "version-" prefix)
 *
 * @param binaryType - The binary type to resolve
 * @param channel - The channel to resolve (default: "LIVE")
 * @returns Promise resolving to version hash (e.g., "version-abc123def456")
 * @throws Error if version cannot be resolved
 */
export async function resolveLatestVersion(
  binaryType: RddBinaryType,
  channel: string = "LIVE"
): Promise<string> {
  // Map binary type to platform for API calls
  const platform = mapBinaryTypeToPlatform(binaryType);

  // Try WEAO first (fastest, includes all platforms)
  try {
    const weaoVersion = await resolveFromWeao(platform);
    if (weaoVersion) {
      console.log(`[RDD] Resolved from WEAO: ${weaoVersion}`);
      return normalizeVersion(weaoVersion);
    }
  } catch (error) {
    console.warn("[RDD] WEAO resolution failed, falling back to clientsettings:", error);
  }

  // Fallback to Roblox clientsettings API
  try {
    const clientSettingsVersion = await resolveFromClientSettings(platform, channel);
    console.log(`[RDD] Resolved from clientsettings: ${clientSettingsVersion}`);
    return normalizeVersion(clientSettingsVersion);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Failed to resolve version for ${binaryType} on ${channel}: ${errorMessage}`
    );
  }
}

/**
 * Map RDD binary type to platform name for API calls
 */
function mapBinaryTypeToPlatform(binaryType: RddBinaryType): string {
  switch (binaryType) {
    case "WindowsPlayer":
    case "WindowsStudio64":
      return "WindowsPlayer";
    case "MacPlayer":
    case "MacStudio":
      return "MacPlayer";
    default:
      return "WindowsPlayer";
  }
}

/**
 * Resolve version from WEAO API (via our proxy)
 */
async function resolveFromWeao(platform: string): Promise<string | null> {
  const response = await fetch("/api/weao/versions/current");

  if (!response.ok) {
    // Log 502 errors but don't throw - we'll fall back to clientsettings
    if (response.status === 502) {
      console.warn("[RDD] WEAO proxy returned 502 Bad Gateway");
    }
    return null;
  }

  const data = await response.json();

  // WEAO returns versions keyed by platform name (Windows, Mac, Android, iOS)
  const platformKey = platform.replace("Player", "");
  const version = data[platformKey];

  if (!version) {
    console.warn(`[RDD] WEAO response missing version for ${platformKey}`);
    return null;
  }

  return version;
}

/**
 * Resolve version from Roblox clientsettings API
 *
 * Tries v2 endpoint first, falls back to v1 if needed
 */
async function resolveFromClientSettings(
  platform: string,
  channel: string
): Promise<string> {
  // Try v2 endpoint first (more reliable)
  const v2Endpoint =
    channel === "LIVE"
      ? `https://clientsettings.roblox.com/v2/client-version/${platform}`
      : `https://clientsettings.roblox.com/v2/client-version/${platform}/channel/${channel}`;

  try {
    const response = await fetch(v2Endpoint);

    if (response.ok) {
      const data = await response.json();
      const version = data.clientVersionUpload || data.version;

      if (version) {
        return version;
      }
    }

    console.warn(`[RDD] v2 endpoint returned ${response.status}, trying v1`);
  } catch (error) {
    console.warn("[RDD] v2 endpoint error:", error);
  }

  // Fallback to v1 endpoint
  const v1Endpoint =
    channel === "LIVE"
      ? `https://clientsettings.roblox.com/v1/client-version/${platform}`
      : `https://clientsettings.roblox.com/v1/client-version/${platform}/channel/${channel}`;

  const response = await fetch(v1Endpoint);

  if (!response.ok) {
    throw new Error(
      `Failed to resolve version from both v2 and v1 endpoints: ${response.statusText || response.status}`
    );
  }

  const data = await response.json();
  const version = data.clientVersionUpload || data.version;

  if (!version) {
    throw new Error("Version response missing clientVersionUpload field");
  }

  return version;
}

/**
 * Normalize version to have "version-" prefix
 */
function normalizeVersion(version: string): string {
  if (!version) {
    throw new Error("Version is empty");
  }

  return version.startsWith("version-") ? version : `version-${version}`;
}
