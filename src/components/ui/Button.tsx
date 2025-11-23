import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-DEFAULT";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
      ghost:
        "bg-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary",
      danger:
        "bg-danger text-white hover:bg-danger/90 active:bg-danger/80",
      success:
        "bg-success text-white hover:bg-success/90 active:bg-success/80",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-base rounded-lg",
      lg: "h-12 px-6 text-lg rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
