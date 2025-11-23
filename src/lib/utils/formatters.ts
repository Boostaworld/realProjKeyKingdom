import { formatDistanceToNow } from "date-fns";

export function formatPrice(
  price: number | undefined,
  currency = "USD"
): string {
  if (!price || price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

export function formatRelativeTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(value, { addSuffix: true });
}

export function formatSuncRating(
  sunc: number
): {
  label: string;
  color: string;
  hexColor: string;
  glowColor: string;
} {
  if (sunc >= 90) {
    return {
      label: "Very Safe",
      color: "text-accent-plasma",
      hexColor: "#00FF88",
      glowColor: "0 0 20px rgba(0, 255, 136, 0.6)",
    };
  }
  if (sunc >= 75) {
    return {
      label: "Safe",
      color: "text-success",
      hexColor: "#43B581",
      glowColor: "0 0 16px rgba(67, 181, 129, 0.5)",
    };
  }
  if (sunc >= 50) {
    return {
      label: "Moderate",
      color: "text-warning",
      hexColor: "#FAA61A",
      glowColor: "0 0 16px rgba(250, 166, 26, 0.5)",
    };
  }
  return {
    label: "Risky",
    color: "text-danger",
    hexColor: "#F04747",
    glowColor: "0 0 16px rgba(240, 71, 71, 0.5)",
  };
}
