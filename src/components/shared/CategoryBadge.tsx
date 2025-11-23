import { Badge } from "@/components/ui/Badge";
import type { ExecutorCategory } from "@/types/executor";

interface CategoryBadgeProps {
  category: ExecutorCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = {
    reputable: {
      label: "Reputable",
      variant: "success" as const,
    },
    suspicious: {
      label: "Suspicious",
      variant: "warning" as const,
    },
  };

  const { label, variant } = config[category];

  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      {label}
    </Badge>
  );
}
