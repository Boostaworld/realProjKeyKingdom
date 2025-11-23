"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store/appStore";
import { cn } from "@/lib/utils/cn";
import type { Platform } from "@/types/executor";

export function FilterBar() {
  const {
    platformFilter,
    categoryFilter,
    searchQuery,
    setPlatformFilter,
    setCategoryFilter,
    setSearchQuery,
    resetFilters,
  } = useAppStore();

  const [input, setInput] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(input), 300);
    return () => clearTimeout(t);
  }, [input, setSearchQuery]);

  const togglePlatform = (platform: Platform) => {
    const next = platformFilter.includes(platform)
      ? platformFilter.filter((p) => p !== platform)
      : [...platformFilter, platform];

    setPlatformFilter(next);
  };

  const activeFilterCount =
    platformFilter.length +
    (categoryFilter !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-background-surface rounded-lg p-4 mb-6 space-y-4">
      {/* Search + platform filter chips */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          type="search"
          placeholder="Search executors..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />

        <div className="flex gap-2">
          {(["windows", "mac", "mobile"] as Platform[]).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                platformFilter.includes(platform)
                  ? "bg-primary text-white"
                  : "bg-background-elevated text-text-secondary hover:bg-background-elevated/80"
              )}
            >
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category radios + Clear Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">Show:</span>

          {(["all", "reputable", "suspicious"] as const).map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="radio"
                name="category"
                checked={categoryFilter === category}
                onChange={() => setCategoryFilter(category)}
                className="accent-primary"
              />
              <span className="capitalize text-text-primary">
                {category === "all" ? "All" : `${category} Only`}
              </span>
            </label>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
            <Badge variant="default" className="ml-2">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
