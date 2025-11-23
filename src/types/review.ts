export interface Review {
  id: string;
  executorId: string;
  userId: string;
  username: string;

  rating: number; // 1–5
  title?: string;
  content: string;

  verifiedPurchase: boolean;

  helpful: number;
  notHelpful: number;

  createdAt: Date;
  updatedAt?: Date;

  status: "published" | "flagged" | "removed";
}
