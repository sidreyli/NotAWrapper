import { LineIcon } from "./LineIcon";
import { StatusPill } from "./StatusPill";
import type { EligibilityResult } from "../types/api";
import { useAppState } from "../state/AppState";
import { t } from "../lib/i18n";

const icons: Record<string, Parameters<typeof LineIcon>[0]["name"]> = {
  snap: "bag",
  medicaid: "health",
  wic: "health",
  liheap: "bill",
  tanf: "bill",
  chip: "people"
};

export function ResultCard({
  result,
  onExplain,
  onDetails
}: {
  result: EligibilityResult;
  onExplain: (result: EligibilityResult) => void;
  onDetails: (result: EligibilityResult) => void;
}) {
  const { language } = useAppState();
  const confidenceLabel = result.confidence >= 0.8 ? "High confidence" : result.confidence >= 0.65 ? "Moderate confidence" : "Limited confidence";

  return (
    <article className="grid gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card md:grid-cols-[1fr_190px]">
      <div className="flex gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-softAqua text-lineInk">
          <LineIcon name={icons[result.program_id] ?? "doc"} />
        </div>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-3xl font-black text-dark">{result.program_name}</h3>
            <StatusPill status={result.status} />
          </div>
          <p className="max-w-3xl text-lg leading-8 text-slate-700">{result.reason}</p>
          <div className="mt-5 flex flex-wrap gap-5 font-extrabold">
            <button className="text-review" onClick={() => onExplain(result)} type="button">
              ? {t(language, "whyResult")}
            </button>
            <button className="text-teal" onClick={() => onDetails(result)} type="button">
              {t(language, "viewDetails")} {'->'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-center md:items-end">
        <p className="text-sm font-bold text-slate-400">Estimated benefit</p>
        <p className="mt-2 font-display text-3xl font-black text-success">{result.estimated_monthly_benefit ?? "-"}</p>
        <p className="mt-4 text-sm font-bold text-slate-400">{confidenceLabel}</p>
        <div className="mt-2 h-1.5 w-36 rounded-full bg-slate-200">
          <div className="h-1.5 rounded-full bg-success" style={{ width: `${Math.max(12, result.confidence * 100)}%` }} />
        </div>
      </div>
    </article>
  );
}
