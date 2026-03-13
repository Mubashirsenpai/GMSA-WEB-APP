import { formatDistanceToNow } from "date-fns";

/**
 * Returns relative time string: "just now", "34 minutes ago", "3 days ago", "1 month ago", etc.
 * Uses updatedAt when provided and different from createdAt; otherwise uses createdAt.
 */
export function getRelativeTime(updatedAt?: string | null, createdAt?: string | null): string | null {
  const date = updatedAt || createdAt;
  if (!date) return null;
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    const now = Date.now();
    const diffSeconds = (now - d.getTime()) / 1000;
    if (diffSeconds < 60) return "just now";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return null;
  }
}
