import { formatDistanceToNow } from "date-fns";

export function RelativeTime({ date }: { date: Date | number }) {
  const formatted = formatDistanceToNow(date, { addSuffix: true });
  const replaced = formatted.replace(/^about /, "");
  return <span className="text-sm">{replaced}</span>;
}
