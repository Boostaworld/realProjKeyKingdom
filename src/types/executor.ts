export type Platform = "windows" | "mac" | "mobile" | "android";

export type ExecutorCategory = "reputable" | "suspicious";

export interface ExecutorStatus {
  working: boolean;
  robloxVersion: string;
  lastChecked: Date;
  lastStatusChange?: Date;
}

export interface ExecutorPricing {
  type: "free" | "paid" | "freemium";
  price?: number;
  currency?: string;
  purchaseUrl: string;
  freeTrial?: boolean;
  rawCostString?: string; // from WEAO, e.g. "$20 Lifetime"
}

export interface ExecutorRating {
  average: number; // 0–5
  count: number;
}

export interface ExecutorLinks {
  website?: string;
  discord?: string;
  documentation?: string;
}

export interface Executor {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  logo: string;
  images?: string[];

  // Safety & Status
  suncRating: number; // 0–100 (derived from WEAO suncPercentage)
  category: ExecutorCategory;
  status: ExecutorStatus;

  // Platform Support
  platforms: {
    windows: boolean;
    mac: boolean;
    mobile: boolean;
    android?: boolean;
  };

  // Commerce
  pricing: ExecutorPricing;

  // Social
  rating: ExecutorRating;
  links?: ExecutorLinks;

  // Features
  features: string[];
  keyFeatures?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  popular?: boolean;
}
