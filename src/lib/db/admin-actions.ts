/**
 * Admin Action Database Helpers
 *
 * Functions for logging and querying admin actions (audit trail).
 */

import { prisma } from "@/lib/db";

export interface LogAdminActionParams {
  action: string;
  userId: string;
  executorId?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an admin action to the database
 */
export async function logAdminAction(params: LogAdminActionParams) {
  return await prisma.adminAction.create({
    data: {
      action: params.action,
      userId: params.userId,
      executorId: params.executorId,
      targetId: params.targetId,
      details: params.details ? JSON.stringify(params.details) : undefined,
      changes: params.changes ? JSON.stringify(params.changes) : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

/**
 * Get admin actions for a specific user
 */
export async function getAdminActionsByUser(userId: string, limit: number = 50) {
  return await prisma.adminAction.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Get admin actions for a specific executor
 */
export async function getAdminActionsByExecutor(executorId: string, limit: number = 50) {
  return await prisma.adminAction.findMany({
    where: { executorId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Get recent admin actions
 */
export async function getRecentAdminActions(limit: number = 100) {
  return await prisma.adminAction.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Get admin actions by action type
 */
export async function getAdminActionsByType(action: string, limit: number = 50) {
  return await prisma.adminAction.findMany({
    where: { action },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Search admin actions
 */
export async function searchAdminActions(filters: {
  userId?: string;
  executorId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  return await prisma.adminAction.findMany({
    where: {
      userId: filters.userId,
      executorId: filters.executorId,
      action: filters.action,
      timestamp: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    },
    orderBy: { timestamp: "desc" },
    take: filters.limit || 100,
  });
}
