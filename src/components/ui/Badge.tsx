import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors";

    const variants = {
      default:
        "bg-background-elevated text-text-secondary border border-background-elevated",
      success: "bg-success/10 text-success border border-success/20",
      warning: "bg-warning/10 text-warning border border-warning/20",
      danger: "bg-danger/10 text-danger border border-danger/20",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
