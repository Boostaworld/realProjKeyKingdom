import { cn } from "@/lib/utils/cn";
import { formatSuncRating } from "@/lib/utils/formatters";

interface SuncBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SuncBadge({
  rating,
  size = "md",
  showLabel = true,
}: SuncBadgeProps) {
  const { label, color } = formatSuncRating(rating);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "font-bold tabular-nums",
          sizeClasses[size],
          color
        )}
      >
        {rating}
      </div>
      {showLabel && (
        <div className={cn("text-text-muted font-medium", labelSizes[size])}>
          {label}
        </div>
      )}
    </div>
  );
}
