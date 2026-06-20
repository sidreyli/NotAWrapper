import { ArrowRight, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";
import { ProgramGlyph } from "@/lib/programs";
import type { EligibilityResult } from "@/types/api";

export function ResultCard({
  result,
  onExplain,
  onDetails
}: {
  result: EligibilityResult;
  onExplain: (result: EligibilityResult) => void;
  onDetails: (result: EligibilityResult) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-paper shadow-soft transition hover:border-emerald-200 hover:shadow-lift">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <ProgramGlyph id={result.program_id} className="h-14 w-14" iconClassName="h-7 w-7" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-2xl font-semibold text-ink">{result.program_name}</h3>
              <StatusBadge status={result.status} withIcon />
            </div>
            <p className="mt-2 max-w-xl leading-7 text-haze">{result.reason}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {result.required_documents.slice(0, 3).map((doc) => (
                <span
                  key={doc}
                  className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-haze"
                >
                  {doc}
                </span>
              ))}
              {result.required_documents.length > 3 && (
                <span className="text-xs font-medium text-haze">
                  +{result.required_documents.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {result.estimated_monthly_benefit && (
          <div className="shrink-0 rounded-2xl bg-mint px-4 py-3 text-center">
            <p className="font-display text-xl font-semibold text-emerald-700">
              {result.estimated_monthly_benefit}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/70">
              estimated
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-canvas/60 px-6 py-3">
        <Button size="sm" onClick={() => onDetails(result)}>
          View details
          <ArrowRight />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onExplain(result)}>
          <HelpCircle />
          Why this result?
        </Button>
        <a
          href={result.apply_url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-haze transition hover:text-emerald-700"
        >
          Official application
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}
