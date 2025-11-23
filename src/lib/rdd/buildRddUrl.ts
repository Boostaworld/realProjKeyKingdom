/**
 * Build Roblox Deployment Downloader URL for Latte's RDD service
 *
 * This helper constructs the correct URL to delegate downloads to https://rdd.latte.to
 * instead of doing client-side assembly ourselves. Latte's RDD handles manifest parsing,
 * package downloading, and ZIP assembly - we just provide the UI and version resolution.
 *
 * Reference: https://github.com/latte-soft/rdd
 */

export type RddBinaryType =
  | "WindowsPlayer"
  | "WindowsStudio64"
  | "MacPlayer"
  | "MacStudio";

export interface RddOptions {
  /**
   * Roblox deployment channel
   * @default "LIVE"
   */
  channel?: string;

  /**
   * Binary type to download
   */
  binaryType: RddBinaryType;

  /**
   * Optional version hash (e.g., "version-abc123def456")
   * If not provided, Latte's RDD will use the latest version
   */
  version?: string;

  /**
   * Whether to compress the output ZIP
   * @default true
   */
  compressZip?: boolean;

  /**
   * Compression level (1-9)
   * 1 = fastest, least compression
   * 9 = slowest, most compression
   * @default 5
   */
  compressionLevel?: number;
}

/**
 * Build the RDD download URL for Latte's service
 *
 * @example
 * ```ts
 * const url = buildRddUrl({
 *   channel: "LIVE",
 *   binaryType: "WindowsPlayer",
 *   version: "version-e380c8edc8f6477c",
 *   compressZip: true,
 *   compressionLevel: 5,
 * });
 * // Returns: https://rdd.latte.to/?channel=LIVE&binaryType=WindowsPlayer&version=version-e380c8edc8f6477c&compressZip=true&compressionLevel=5
 * ```
 */
export function buildRddUrl(opts: RddOptions): string {
  const params = new URLSearchParams();

  // Channel (default to LIVE)
  const channel = opts.channel || "LIVE";
  params.set("channel", channel);

  // Binary type (required)
  params.set("binaryType", opts.binaryType);

  // Version (optional - Latte's RDD will auto-resolve if not provided)
  if (opts.version) {
    // Ensure version has the "version-" prefix
    const normalizedVersion = opts.version.startsWith("version-")
      ? opts.version
      : `version-${opts.version}`;
    params.set("version", normalizedVersion);
  }

  // Compression settings (only add if compression is enabled)
  if (opts.compressZip !== false) {
    params.set("compressZip", "true");

    // Compression level (1-9, default 5)
    const level = opts.compressionLevel ?? 5;
    const clampedLevel = Math.max(1, Math.min(9, level));
    params.set("compressionLevel", clampedLevel.toString());
  }

  return `https://rdd.latte.to/?${params.toString()}`;
}
