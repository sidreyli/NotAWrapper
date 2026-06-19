import { useState } from "react";
import { Button } from "../components/Button";
import { ExplainabilityDrawer } from "../components/ExplainabilityDrawer";
import { ResultCard } from "../components/ResultCard";
import { useAppState } from "../state/AppState";
import type { EligibilityResult, EligibilityStatus } from "../types/api";
import { t } from "../lib/i18n";

const groups: Array<{ title: string; statuses: EligibilityStatus[]; dot: string }> = [
  { title: "Programs you likely qualify for", statuses: ["likely_eligible"], dot: "bg-success" },
  { title: "Worth a look", statuses: ["possibly_eligible", "already_receiving", "unable_to_determine"], dot: "bg-review" },
  { title: "Probably not a fit right now", statuses: ["likely_ineligible"], dot: "bg-slate-400" }
];

export function ResultsPage({ navigate }: { navigate: (path: string) => void }) {
  const { language, profile, results, actionPlan, setSelectedProgramId, reset } = useAppState();
  const [drawerResult, setDrawerResult] = useState<EligibilityResult | null>(null);
  const likelyCount = results.filter((result) => result.status === "likely_eligible").length;

  const openDetails = (result: EligibilityResult) => {
    setSelectedProgramId(result.program_id);
    navigate(`/programs/${result.program_id}`);
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.22em] text-teal">Your results</p>
      <h1 className="display-heading max-w-4xl text-6xl text-dark">Based on what you shared, here's what we found</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full border border-border bg-surface px-5 py-2 font-bold">{profile.state}</span>
        <span className="rounded-full border border-border bg-surface px-5 py-2 font-bold">Household of {profile.household_size}</span>
        <span className="rounded-full border border-border bg-surface px-5 py-2 font-bold">{profile.children_under_18} children</span>
        <span className="rounded-full border border-border bg-surface px-5 py-2 font-bold">~${profile.monthly_gross_income.toLocaleString()}/mo</span>
      </div>

      <div className="mt-8 flex flex-col gap-6 rounded-2xl bg-dark p-7 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black text-aqua">{likelyCount}</span>
            <span className="max-w-36 text-lg font-bold text-cyan-50">programs you likely qualify for</span>
          </div>
          <div className="hidden h-16 border-l border-white/20 md:block" />
          <div className="flex items-center gap-4">
            <span className="font-display text-5xl font-black">~$512</span>
            <span className="max-w-40 text-lg font-bold text-cyan-50">estimated monthly value</span>
          </div>
        </div>
        <Button variant="aqua" onClick={() => navigate("/benefits-cliff")}>
          {t(language, "benefitsCliff")} {'->'}
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-lg text-violet-900">
        These are estimates to help you decide where to apply. Final eligibility is decided by each agency.
      </div>

      <article className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-3 font-display text-3xl font-black text-dark">Plain-language action plan</h2>
        <p className="text-lg leading-8 text-slate-700">{actionPlan.action_plan_text}</p>
        <p className="mt-5 text-sm text-muted">{actionPlan.disclaimer}</p>
      </article>

      <div className="mt-12 space-y-12">
        {groups.map((group) => {
          const groupResults = results.filter((result) => group.statuses.includes(result.status));
          if (!groupResults.length) return null;
          return (
            <section key={group.title}>
              <h2 className="mb-5 flex items-center gap-3 font-display text-3xl font-black uppercase text-dark">
                <span className={`h-3 w-3 rounded-full ${group.dot}`} />
                {group.title}
                <span className="font-body text-base font-bold normal-case text-slate-400">{groupResults.length} programs</span>
              </h2>
              <div className="space-y-5">
                {groupResults.map((result) => (
                  <ResultCard key={result.program_id} result={result} onExplain={setDrawerResult} onDetails={openDetails} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
        <Button variant="secondary" onClick={() => window.print()}>{t(language, "print")}</Button>
        <Button
          variant="ghost"
          onClick={() => {
            reset();
            navigate("/");
          }}
        >
          {t(language, "startOver")}
        </Button>
      </div>
      <p className="mt-8 text-muted">
        Every result is produced by a deterministic rules engine using published 2026 federal and state thresholds. The AI only puts results into plain language.
      </p>
      <ExplainabilityDrawer result={drawerResult} profile={profile} onClose={() => setDrawerResult(null)} />
    </section>
  );
}
