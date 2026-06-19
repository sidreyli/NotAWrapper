import { statusLabel } from "../lib/i18n";
import { useAppState } from "../state/AppState";
import type { EligibilityStatus } from "../types/api";

const styles: Record<EligibilityStatus, string> = {
  likely_eligible: "bg-green-50 text-success ring-green-200",
  possibly_eligible: "bg-amber-50 text-warning ring-amber-200",
  already_receiving: "bg-softAqua text-teal ring-cyan-200",
  unable_to_determine: "bg-violet-50 text-review ring-violet-200",
  likely_ineligible: "bg-gray-100 text-slate-600 ring-gray-200"
};

export function StatusPill({ status }: { status: EligibilityStatus }) {
  const { language } = useAppState();
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold ring-1 ${styles[status]}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {statusLabel(language, status)}
    </span>
  );
}
