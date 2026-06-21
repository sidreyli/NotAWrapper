import { Check, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { StatusBadge } from "./StatusBadge";
import { ProgramGlyph } from "@/lib/programs";
import { useT } from "@/i18n";
import type { EligibilityResult, UserProfile } from "@/types/api";

export function ExplainabilityDrawer({
  result,
  profile,
  onClose
}: {
  result: EligibilityResult | null;
  profile: UserProfile;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Sheet open={!!result} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-l border-border bg-canvas sm:max-w-lg">
        {result && (
          <>
            <SheetHeader className="space-y-0 text-left">
              <div className="flex items-center gap-3">
                <ProgramGlyph id={result.program_id} className="h-12 w-12" iconClassName="h-6 w-6" />
                <div>
                  <SheetTitle className="font-display text-2xl font-semibold text-ink">
                    {result.program_name}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    {t("explain.descSr")}
                  </SheetDescription>
                  <div className="mt-1">
                    <StatusBadge status={result.status} withIcon />
                  </div>
                </div>
              </div>
            </SheetHeader>

            <p className="mt-6 leading-7 text-haze">{result.reason}</p>

            <div className="mt-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {t("detail.rulesChecked")}
              </p>
              <div className="space-y-2.5">
                {result.eligibility_factors.map((factor) => (
                  <div
                    key={factor.factor_name}
                    className="rounded-2xl border border-border bg-paper p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-ink">{factor.factor_name}</h4>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          factor.passes
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-muted text-haze"
                        }`}
                      >
                        {factor.passes ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {factor.passes ? t("factor.passes") : t("factor.review")}
                      </span>
                    </div>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      <dt className="text-haze">{t("factor.you")}</dt>
                      <dd className="text-ink">{factor.user_value}</dd>
                      <dt className="text-haze">{t("factor.rule")}</dt>
                      <dd className="text-ink">{factor.threshold}</dd>
                    </dl>
                    {factor.note && <p className="mt-2 text-xs text-haze">{factor.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-emerald-200/70 bg-mint/50 p-5 text-sm leading-6 text-haze">
              <p>
                <span className="font-semibold text-emerald-800">{t("explain.source")}</span>{" "}
                {result.data_source}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-emerald-800">{t("explain.dataAsOf")}</span>{" "}
                {result.data_as_of}
              </p>
              <p className="mt-3 text-haze/80">
                {t("explain.footer", { count: profile.household_size, state: profile.state })}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
