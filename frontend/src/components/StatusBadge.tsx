import { CircleDashed, CircleHelp, MinusCircle, Sparkles, ThumbsUp } from "lucide-react";
import { useStatusLabel } from "@/i18n";
import type { EligibilityStatus } from "@/types/api";

const config: Record<
  EligibilityStatus,
  { dot: string; chip: string; icon: typeof ThumbsUp }
> = {
  likely_eligible: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: ThumbsUp
  },
  possibly_eligible: {
    dot: "bg-gold-500",
    chip: "bg-gold-50 text-gold-600 ring-gold-300/60",
    icon: Sparkles
  },
  already_receiving: {
    dot: "bg-sky",
    chip: "bg-[#E7F0FA] text-sky ring-sky/30",
    icon: ThumbsUp
  },
  unable_to_determine: {
    dot: "bg-lilac",
    chip: "bg-[#EFEBFB] text-lilac ring-lilac/30",
    icon: CircleHelp
  },
  likely_ineligible: {
    dot: "bg-haze",
    chip: "bg-muted text-haze ring-border",
    icon: MinusCircle
  }
};

export function StatusBadge({
  status,
  className = "",
  withIcon = false
}: {
  status: EligibilityStatus;
  className?: string;
  withIcon?: boolean;
}) {
  const statusLabel = useStatusLabel();
  const c = config[status] ?? { dot: "bg-haze", chip: "bg-muted text-haze ring-border", icon: CircleDashed };
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${c.chip} ${className}`}
    >
      {withIcon ? (
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      )}
      {statusLabel(status)}
    </span>
  );
}
