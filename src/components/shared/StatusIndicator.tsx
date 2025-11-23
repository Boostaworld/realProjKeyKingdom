import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { ExecutorStatus } from "@/types/executor";

interface StatusIndicatorProps {
  status: ExecutorStatus;
  compact?: boolean;
}

export function StatusIndicator({ status, compact = false }: StatusIndicatorProps) {
  const { working, robloxVersion, lastChecked } = status;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            working ? "bg-success" : "bg-danger"
          )}
        />
        <span
          className={cn(
            "font-medium text-sm",
            working ? "text-success" : "text-danger"
          )}
        >
          {working ? "Working" : "Not Working"}
        </span>
      </div>

      {!compact && (
        <>
          <div className="text-xs text-text-muted font-mono">
            {robloxVersion}
          </div>
          <div className="text-xs text-text-muted">
            {formatRelativeTime(lastChecked)}
          </div>
        </>
      )}
    </div>
  );
}
