"use client";

import { useMemo } from "react";
import { useExecutors, sortExecutorsBySUNC } from "@/lib/hooks/useExecutors";
import { useAppStore } from "@/lib/store/appStore";
import { ExecutorRow } from "./ExecutorRow";

export function ExecutorTable() {
  const { data: executors, isLoading, isError } = useExecutors();
  const {
    platformFilter,
    categoryFilter,
    searchQuery,
  } = useAppStore();

  const filteredExecutors = useMemo(() => {
    if (!executors) return [];

    let result = [...executors];

    // Platform filter
    if (platformFilter.length > 0) {
      result = result.filter((executor) =>
        platformFilter.some((platform) => executor.platforms[platform])
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (executor) => executor.category === categoryFilter
      );
    }

    // Search (name + description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (executor) =>
          executor.name.toLowerCase().includes(query) ||
          executor.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [executors, platformFilter, categoryFilter, searchQuery]);

  const sortedExecutors = useMemo(
    () => sortExecutorsBySUNC(filteredExecutors),
    [filteredExecutors]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-secondary">
        Loading executors...
      </div>
    );
  }

  if (isError || !executors) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-text-secondary mb-2">
          Failed to load executors.
        </div>
        <div className="text-text-muted text-sm">
          Please try again in a moment.
        </div>
      </div>
    );
  }

  if (sortedExecutors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-text-secondary mb-2">No executors found</div>
        <div className="text-text-muted text-sm">
          Try adjusting your filters or search query.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-background-elevated bg-background-surface">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-background-elevated bg-background-elevated/40">
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Executor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              sUNC
              <span className="ml-1 text-[10px] uppercase text-text-muted">
                (sorted)
              </span>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Platform
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Rating
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
              Price
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedExecutors.map((executor, index) => (
            <ExecutorRow key={executor.id} executor={executor} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
