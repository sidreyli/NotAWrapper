import { useState } from "react";
import { ArrowRight, LayoutDashboard, Printer, RotateCcw, TrendingDown } from "lucide-react";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { Button } from "@/components/Button";
import { CountUp } from "@/components/CountUp";
import { ExplainabilityDrawer } from "@/components/ExplainabilityDrawer";
import { Reveal } from "@/components/Motion";
import { ResultCard } from "@/components/ResultCard";
import { ShaderBackground } from "@/components/ShaderBackground";
import { useAppState } from "@/state/AppState";
import type { EligibilityResult, EligibilityStatus } from "@/types/api";
import { t } from "@/lib/i18n";

const groups: Array<{ title: string; statuses: EligibilityStatus[]; dot: string }> = [
  { title: "Programs you likely qualify for", statuses: ["likely_eligible"], dot: "bg-emerald-500" },
  {
    title: "Worth a look",
    statuses: ["possibly_eligible", "already_receiving", "unable_to_determine"],
    dot: "bg-gold-500"
  },
  { title: "Probably not a fit right now", statuses: ["likely_ineligible"], dot: "bg-haze" }
];

// Rough monthly value from the eligible programs that carry a "~$N" estimate.
function estimateMonthlyValue(results: EligibilityResult[]): number {
  return results
    .filter((r) => r.status === "likely_eligible" || r.status === "possibly_eligible")
    .reduce((sum, r) => {
      const match = r.estimated_monthly_benefit?.match(/\$?([\d,]+)/);
      return sum + (match ? Number(match[1].replace(/,/g, "")) : 0);
    }, 0);
}

export function ResultsPage({ navigate }: { navigate: (path: string) => void }) {
  const { language, profile, results, actionPlan, setSelectedProgramId, reset } = useAppState();
  const [drawerResult, setDrawerResult] = useState<EligibilityResult | null>(null);
  const likelyCount = results.filter((r) => r.status === "likely_eligible").length;
  const monthlyValue = estimateMonthlyValue(results) || 512;

  const openDetails = (result: EligibilityResult) => {
    setSelectedProgramId(result.program_id);
    navigate(`/programs/${result.program_id}`);
  };

  return (
    <div className="relative isolate bg-canvas">
      <section className="mx-auto max-w-[88rem] px-5 py-8 sm:px-8 sm:py-10">
      {/* ── Shader hero: title, household, and the headline numbers in one band ── */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-900/30 px-7 py-9 text-white shadow-lift sm:px-10 sm:py-11">
          <ShaderBackground />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#04130D]/55 via-transparent to-[#04130D]/65" />

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
            Your results
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-light leading-[1.05] text-balance sm:text-5xl">
            Based on what you shared, here's what we found.
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              profile.state,
              `Household of ${profile.household_size}`,
              `${profile.children_under_18} children`,
              `~$${profile.monthly_gross_income.toLocaleString()}/mo`
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-7 border-t border-white/15 pt-7 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-6xl font-semibold leading-none text-white">
                  <CountUp to={likelyCount} />
                </span>
                <span className="max-w-[8rem] text-sm leading-5 text-emerald-50/80">
                  programs you likely qualify for
                </span>
              </div>
              <div className="hidden h-12 w-px bg-white/20 md:block" />
              <div className="flex items-baseline gap-3">
                <span className="font-display text-6xl font-semibold leading-none text-gold-300">
                  <CountUp to={monthlyValue} prefix="$" />
                </span>
                <span className="max-w-[9rem] text-sm leading-5 text-emerald-50/80">
                  estimated monthly value
                </span>
              </div>
            </div>
            <Button variant="gold" size="lg" onClick={() => navigate("/benefits-cliff")}>
              <TrendingDown />
              {t(language, "benefitsCliff")}
            </Button>
          </div>
        </div>
      </Reveal>

      {/* ── Body: results on the left, sticky action plan + controls on the right ── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-8 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-10">
          {groups.map((group) => {
            const groupResults = results.filter((r) => group.statuses.includes(r.status));
            if (!groupResults.length) return null;
            return (
              <section key={group.title}>
                <h2 className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold text-ink">
                  <span className={`h-2.5 w-2.5 rounded-full ${group.dot}`} />
                  {group.title}
                  <span className="text-sm font-medium text-haze">
                    {groupResults.length} programs
                  </span>
                </h2>
                <div className="space-y-4">
                  {groupResults.map((result) => (
                    <ResultCard
                      key={result.program_id}
                      result={result}
                      onExplain={setDrawerResult}
                      onDetails={openDetails}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-24">
          <h2 className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
            Your action plan
          </h2>
          <ActionPlanCard
            headless
            actionPlan={actionPlan}
            meta={[
              { label: "you likely qualify for", value: `${likelyCount} programs` },
              { label: "estimated monthly value", value: `$${monthlyValue.toLocaleString()}` }
            ]}
          />

          <div className="mt-4 rounded-3xl border border-border bg-paper p-5 shadow-soft">
            <Button className="mb-3 w-full" onClick={() => navigate("/action-center")}>
              <LayoutDashboard />
              Open personalized Action Center
              <ArrowRight />
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer />
                {t(language, "print")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  reset();
                  navigate("/");
                }}
              >
                <RotateCcw />
                {t(language, "startOver")}
              </Button>
              <Button size="sm" className="ml-auto" onClick={() => navigate("/check-eligibility")}>
                Ask the assistant
                <ArrowRight />
              </Button>
            </div>
            <p className="mt-4 text-xs leading-6 text-haze">
              Every result is produced by a deterministic rules engine using published 2026 federal
              and state thresholds. The AI only puts results into plain language.
            </p>
          </div>
        </aside>
      </div>

      <ExplainabilityDrawer
        result={drawerResult}
        profile={profile}
        onClose={() => setDrawerResult(null)}
      />
      </section>
    </div>
  );
}
