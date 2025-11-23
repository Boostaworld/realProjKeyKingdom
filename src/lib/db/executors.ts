/**
 * Executor Database Helpers
 *
 * Functions for managing executor overrides and history.
 */

import { prisma } from "@/lib/db";

// ============================================
// Executor Overrides
// ============================================

export interface CreateExecutorOverrideParams {
  executorId: string;
  working: boolean;
  reason: string;
  expiresAt?: Date;
  createdBy: string;
  notifyWebhooks?: boolean;
}

/**
 * Create an executor status override
 */
export async function createExecutorOverride(params: CreateExecutorOverrideParams) {
  // Deactivate any existing active overrides for this executor
  await prisma.executorOverride.updateMany({
    where: {
      executorId: params.executorId,
      active: true,
    },
    data: {
      active: false,
    },
  });

  // Create new override
  return await prisma.executorOverride.create({
    data: {
      executorId: params.executorId,
      working: params.working,
      reason: params.reason,
      expiresAt: params.expiresAt,
      createdBy: params.createdBy,
      notifiedWebhooks: params.notifyWebhooks || false,
    },
  });
}

/**
 * Get active override for an executor
 */
export async function getActiveExecutorOverride(executorId: string) {
  const override = await prisma.executorOverride.findFirst({
    where: {
      executorId,
      active: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If expired, deactivate it
  if (override && override.expiresAt && override.expiresAt < new Date()) {
    await prisma.executorOverride.update({
      where: { id: override.id },
      data: { active: false },
    });
    return null;
  }

  return override;
}

/**
 * Remove an executor override
 */
export async function removeExecutorOverride(executorId: string) {
  return await prisma.executorOverride.updateMany({
    where: {
      executorId,
      active: true,
    },
    data: {
      active: false,
    },
  });
}

/**
 * Get all overrides for an executor (history)
 */
export async function getExecutorOverrideHistory(executorId: string) {
  return await prisma.executorOverride.findMany({
    where: { executorId },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================
// Executor History
// ============================================

export interface LogExecutorHistoryParams {
  executorId: string;
  action: string;
  userId?: string;
  changes: Record<string, unknown>;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  source?: string;
}

/**
 * Log an executor change to history
 */
export async function logExecutorHistory(params: LogExecutorHistoryParams) {
  return await prisma.executorHistory.create({
    data: {
      executorId: params.executorId,
      action: params.action,
      userId: params.userId,
      changes: JSON.stringify(params.changes),
      previousData: params.previousData ? JSON.stringify(params.previousData) : undefined,
      newData: params.newData ? JSON.stringify(params.newData) : undefined,
      source: params.source || "admin",
    },
  });
}

/**
 * Get executor change history
 */
export async function getExecutorHistory(executorId: string, limit: number = 50) {
  return await prisma.executorHistory.findMany({
    where: { executorId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Get executor history by action type
 */
export async function getExecutorHistoryByAction(
  executorId: string,
  action: string,
  limit: number = 50
) {
  return await prisma.executorHistory.findMany({
    where: {
      executorId,
      action,
    },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Get recent executor changes (all executors)
 */
export async function getRecentExecutorChanges(limit: number = 100) {
  return await prisma.executorHistory.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
