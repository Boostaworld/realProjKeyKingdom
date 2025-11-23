import { FilterBar } from "@/components/shop/FilterBar";
import { ExecutorTable } from "@/components/shop/ExecutorTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-DEFAULT">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Key-Kingdom
          </h1>
          <p className="text-lg text-text-secondary">
            Browse, compare, and purchase Roblox executors safely
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar />

        {/* Main Table - Sorted by sUNC (highest safety first) */}
        <ExecutorTable />

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-text-muted">
          Executors sorted by sUNC safety rating (highest first)
        </div>
      </div>
    </div>
  );
}
