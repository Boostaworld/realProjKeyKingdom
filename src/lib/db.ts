/**
 * Prisma Database Client
 *
 * Singleton instance of Prisma Client to avoid multiple connections.
 * Hot-reloading safe for Next.js development.
 */

import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper function to safely disconnect (for cleanup in tests/scripts)
export async function disconnectDb() {
  await prisma.$disconnect();
}

// Export types for convenience
export type { ApiKey, AdminAction, ExecutorOverride, ExecutorHistory, Webhook, WebhookDelivery } from "@prisma/client";
