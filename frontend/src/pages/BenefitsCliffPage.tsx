import { useEffect, useState } from "react";
import { ArrowLeft, Info, TrendingDown } from "lucide-react";
import { BenefitCliffChart } from "@/components/BenefitCliffChart";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Motion";
import { calculateCliff } from "@/lib/api";
import { makeSampleCliff } from "@/lib/sampleData";
import { useAppState } from "@/state/AppState";
import { useT } from "@/i18n";
import type { CliffResponse } from "@/types/api";

export function BenefitsCliffPage({ navigate }: { navigate: (path: string) => void }) {
  const { profile } = useAppState();
  const t = useT();
  const [maxIncome, setMaxIncome] = useState(5000);
  const [cliff, setCliff] = useState<CliffResponse>(() => makeSampleCliff(profile));

  useEffect(() => {
    calculateCliff(profile, maxIncome).then(setCliff);
  }, [profile, maxIncome]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <button
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-haze transition hover:text-emerald-700"
        onClick={() => navigate("/results")}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("detail.back")}
      </button>

      <Reveal className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/60 bg-gold-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          <TrendingDown className="h-3.5 w-3.5" />
          {t("cliff.badge")}
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-5xl font-light leading-tight text-ink text-balance">
          {t("cliff.heading")}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-haze">
          {t("cliff.intro")}
        </p>
      </Reveal>

      <div className="my-8 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-paper p-4 shadow-soft">
        <label className="text-sm font-semibold text-ink" htmlFor="maxIncome">
          {t("cliff.showIncomeUpTo")}
        </label>
        <input
          id="maxIncome"
          type="range"
          min={3000}
          max={10000}
          step={500}
          value={maxIncome}
          onChange={(e) => setMaxIncome(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-mint accent-emerald-500"
        />
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-emerald-700">
          {t("cliff.perMonth", { amount: maxIncome.toLocaleString() })}
        </span>
      </div>

      <BenefitCliffChart cliff={cliff} />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {cliff.cliff_zones.map((zone) => (
          <div
            key={`${zone.income_start}-${zone.income_end}`}
            className="rounded-3xl border border-gold-300/60 bg-gold-50 p-6"
          >
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-gold-600">
              <TrendingDown className="h-5 w-5" />
              {t("cliff.zone")}
            </h2>
            <p className="mt-3 leading-7 text-ink/75">{zone.description}</p>
            <div className="mt-4 space-y-1 text-sm font-medium text-ink">
              <p>
                {t("cliff.incomeRange", {
                  start: zone.income_start.toLocaleString(),
                  end: zone.income_end.toLocaleString()
                })}
              </p>
              <p>{t("cliff.benefitAffected", { benefit: zone.benefit_lost })}</p>
            </div>
          </div>
        ))}
        <div className="rounded-3xl border border-emerald-200 bg-mint/50 p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-emerald-700">
            <Info className="h-5 w-5" />
            {t("cliff.howToRead")}
          </h2>
          <p className="mt-3 leading-7 text-ink/75">
            {t("cliff.howToReadBody")}
          </p>
        </div>
      </div>

      <Button className="mt-8" variant="outline" onClick={() => navigate("/results")}>
        {t("detail.back")}
      </Button>
    </section>
  );
}
