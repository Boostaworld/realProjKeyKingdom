export interface PlatformStatus {
  platform: string;
  version: string;
  lastUpdated: string;
  status: "stable" | "partial" | "broken";
}

export interface WeaoPlatformStatusResponse {
  Windows: PlatformStatus;
  Mac: PlatformStatus;
  Android: PlatformStatus;
  iOS: PlatformStatus;
  lastFetched: string;
}
