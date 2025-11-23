import { NextResponse } from "next/server";
import type { Executor } from "@/types/executor";
import executorsData from "@/data/executors.json";

export async function GET() {
  try {
    // Transform JSON dates to Date objects
    const executors: Executor[] = executorsData.map((executor) => ({
      ...executor,
      status: {
        ...executor.status,
        lastChecked: new Date(executor.status.lastChecked),
      },
      createdAt: new Date(executor.createdAt),
      updatedAt: new Date(executor.updatedAt),
    }));

    return NextResponse.json(executors);
  } catch (error) {
    console.error("Failed to load executors:", error);
    return NextResponse.json(
      { error: "Failed to load executors" },
      { status: 500 }
    );
  }
}
