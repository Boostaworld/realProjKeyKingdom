import type { Review } from "./review";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;

  role: "user" | "moderator" | "admin";

  reviews: Review[];
  helpfulVotes: string[]; // Review IDs

  createdAt: Date;
  verified: boolean;
}
