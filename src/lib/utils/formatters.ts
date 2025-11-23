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
} {
  if (sunc >= 90) return { label: "Very Safe", color: "text-success" };
  if (sunc >= 75) return { label: "Safe", color: "text-success" };
  if (sunc >= 60) return { label: "Moderate", color: "text-warning" };
  if (sunc >= 40) return { label: "Risky", color: "text-warning" };
  return { label: "Dangerous", color: "text-danger" };
}
