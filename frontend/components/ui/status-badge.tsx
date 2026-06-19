import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types";

const MAP: Record<
  EligibilityStatus,
  { label: string; dot: string; text: string; bg: string; ring: string }
> = {
  likely_eligible: {
    label: "Likely eligible",
    dot: "bg-ok",
    text: "text-ok",
    bg: "bg-ok-wash",
    ring: "ring-ok/20",
  },
  possibly_eligible: {
    label: "Possibly eligible",
    dot: "bg-maybe",
    text: "text-maybe",
    bg: "bg-maybe-wash",
    ring: "ring-maybe/20",
  },
  likely_ineligible: {
    label: "Doesn't match",
    dot: "bg-none",
    text: "text-none",
    bg: "bg-none-wash",
    ring: "ring-none/20",
  },
  already_receiving: {
    label: "Already enrolled",
    dot: "bg-enrolled",
    text: "text-enrolled",
    bg: "bg-enrolled-wash",
    ring: "ring-enrolled/20",
  },
  unable_to_determine: {
    label: "Needs review",
    dot: "bg-review",
    text: "text-review",
    bg: "bg-review-wash",
    ring: "ring-review/20",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: EligibilityStatus;
  className?: string;
}) {
  const s = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        s.bg,
        s.text,
        s.ring,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export const STATUS_LABELS = MAP;
