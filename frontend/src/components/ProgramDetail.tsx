import { ArrowLeft, Check, ExternalLink, FileText, HelpCircle, X } from "lucide-react";
import { Button } from "./Button";
import { ChecklistItem } from "./ChecklistItem";
import { StatusBadge } from "./StatusBadge";
import { ProgramGlyph, programMeta } from "@/lib/programs";
import { useT, type MessageKey } from "@/i18n";
import type { EligibilityResult } from "@/types/api";

export function ProgramDetail({
  result,
  onBack,
  onChecklist,
  onExplain
}: {
  result: EligibilityResult;
  onBack: () => void;
  onChecklist: () => void;
  onExplain: () => void;
}) {
  const t = useT();
  const meta = programMeta(result.program_id);
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <button
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-haze transition hover:text-emerald-700"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("detail.back")}
      </button>

      {/* hero */}
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-paper shadow-soft">
        <div className={`flex flex-wrap items-center gap-5 ${meta.tile} p-7`}>
          <ProgramGlyph id={result.program_id} className="h-16 w-16 bg-paper/70" iconClassName="h-8 w-8" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-haze">
              {t(`program.${result.program_id}.category` as MessageKey)}
            </p>
            <h1 className="font-display text-4xl font-semibold text-ink">{result.program_name}</h1>
          </div>
          <div className="ml-auto">
            <StatusBadge status={result.status} withIcon />
          </div>
        </div>
        <div className="p-7">
          <p className="max-w-2xl text-lg leading-8 text-haze">{result.reason}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button onClick={() => window.open(result.apply_url, "_blank", "noopener,noreferrer")}>
              {t("detail.apply")}
              <ExternalLink />
            </Button>
            <Button variant="soft" onClick={onChecklist}>
              <FileText />
              {t("detail.prepareDocs")}
            </Button>
            <Button variant="ghost" onClick={onExplain}>
              <HelpCircle />
              {t("common.whyResult")}
            </Button>
          </div>
        </div>
      </div>

      {/* detail grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-paper p-7 shadow-soft">
          <h2 className="mb-5 font-display text-2xl font-semibold text-ink">{t("detail.rulesChecked")}</h2>
          <div className="space-y-3">
            {result.eligibility_factors.map((factor) => (
              <div key={factor.factor_name} className="rounded-2xl border border-border bg-canvas/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-ink">{factor.factor_name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      factor.passes ? "bg-emerald-50 text-emerald-700" : "bg-muted text-haze"
                    }`}
                  >
                    {factor.passes ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {factor.passes ? t("factor.passes") : t("factor.review")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-haze">{t("factor.you")}: {factor.user_value}</p>
                <p className="text-sm text-haze">{t("factor.rule")}: {factor.threshold}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-paper p-7 shadow-soft">
          <h2 className="mb-5 font-display text-2xl font-semibold text-ink">{t("detail.docsToBring")}</h2>
          <div className="space-y-2.5">
            {result.required_documents.slice(0, 5).map((doc) => (
              <ChecklistItem key={doc} label={doc} />
            ))}
          </div>
          {result.estimated_monthly_benefit && (
            <div className="mt-5 rounded-2xl bg-mint p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/80">
                {t("detail.estimatedBenefit")}
              </p>
              <p className="font-display text-2xl font-semibold text-emerald-700">
                {result.estimated_monthly_benefit}
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm leading-6 text-haze">
        {t("detail.source", { source: result.data_source, date: result.data_as_of })}
      </p>
    </section>
  );
}
