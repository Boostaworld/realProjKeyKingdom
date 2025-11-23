/**
 * Prisma Database Client
 *
 * Singleton instance of Prisma Client to avoid multiple connections.
 * Hot-reloading safe for Next.js development.
 * Uses LibSQL adapter for Prisma 7 compatibility.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create LibSQL client adapter for Prisma 7
// Use absolute path for database file to ensure it works from scripts
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "prisma", "dev.db");
const databaseUrl = dbPath.startsWith("file:") ? dbPath : `file:${dbPath}`;

const libsql = createClient({
  url: databaseUrl,
});

const adapter = new PrismaLibSql(libsql);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
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
