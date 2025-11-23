import { cn } from "@/lib/utils/cn";
import { formatSuncRating } from "@/lib/utils/formatters";

interface SuncBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showGlow?: boolean;
}

export function SuncBadge({
  rating,
  size = "md",
  showLabel = true,
  showGlow = true,
}: SuncBadgeProps) {
  const { label, color, hexColor, glowColor } = formatSuncRating(rating);

  const sizeClasses = {
    sm: "text-sm w-10 h-10",
    md: "text-lg w-14 h-14",
    lg: "text-2xl w-20 h-20",
    xl: "text-3xl w-24 h-24",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl",
          "backdrop-filter backdrop-blur-md",
          "border-2 transition-all duration-300",
          sizeClasses[size]
        )}
        style={{
          background: `linear-gradient(135deg, rgba(21, 26, 33, 0.9) 0%, rgba(30, 35, 41, 0.9) 100%)`,
          borderColor: hexColor,
          boxShadow: showGlow ? glowColor : "0 4px 16px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          className={cn("font-bold tabular-nums font-mono", color)}
          style={{ textShadow: showGlow ? `0 0 8px ${hexColor}40` : "none" }}
        >
          {rating}
        </div>
        {showLabel && (
          <div className={cn("text-text-muted font-medium uppercase tracking-wide", labelSizes[size])}>
            sUNC
          </div>
        )}
      </div>
    </div>
  );
}
