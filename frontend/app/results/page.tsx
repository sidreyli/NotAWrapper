"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Printer,
  RotateCcw,
  TrendingDown,
  ArrowRight,
  Info,
  Phone,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgramCard } from "@/components/program-card";
import { ActionPlanText } from "@/components/action-plan-text";
import { StatusBadge } from "@/components/ui/status-badge";
import { LogoMark } from "@/components/site/logo";
import { useApp } from "@/lib/store";
import { MOCK_PROFILE, MOCK_RESULTS, MOCK_ACTION_PLAN } from "@/lib/mock";
import { STATE_NAMES } from "@/lib/types";
import { languageByCode } from "@/lib/languages";
import { formatMoney } from "@/lib/utils";

export default function ResultsPage() {
  const router = useRouter();
  const { profile: storeProfile, results: storeResults, actionPlan: storePlan, reset } = useApp();

  // Fall back to the sample case so the page is always meaningful.
  const profile = storeProfile ?? MOCK_PROFILE;
  const results = storeResults ?? MOCK_RESULTS;
  const plan = storePlan ?? MOCK_ACTION_PLAN;

  const { eligible, other } = useMemo(() => {
    const e = results.filter(
      (r) => r.status === "likely_eligible" || r.status === "possibly_eligible"
    );
    const o = results.filter(
      (r) => r.status !== "likely_eligible" && r.status !== "possibly_eligible"
    );
    return { eligible: e, other: o };
  }, [results]);

  function startOver() {
    reset();
    router.push("/");
  }

  const ref = `BN-${profile.state}-${String(profile.household_size).padStart(2, "0")}${profile.children_under_18}${profile.adults}`;

  return (
    <div className="container-page py-10 lg:py-14">
      {/* case header */}
      <div className="rounded-lg border border-line bg-surface p-6 shadow-card sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="eyebrow">Your action plan</p>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
                Ref {ref}
              </span>
            </div>
            <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              {eligible.length} program{eligible.length === 1 ? "" : "s"} you may qualify for
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip label={STATE_NAMES[profile.state] ?? profile.state} />
              <Chip label={`Household of ${profile.household_size}`} />
              {profile.children_under_18 > 0 && (
                <Chip label={`${profile.children_under_18} child${profile.children_under_18 > 1 ? "ren" : ""}`} />
              )}
              <Chip label={`${formatMoney(profile.monthly_gross_income)}/mo`} mono />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print plan
            </Button>
            <Button variant="quiet" size="sm" onClick={startOver}>
              <RotateCcw className="h-4 w-4" />
              Start over
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* main: program cards */}
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {eligible.map((r, i) => (
              <ProgramCard key={r.program_id} result={r} index={i} />
            ))}
          </div>

          {other.length > 0 && (
            <div className="rounded-lg border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-navy">
                Not a match right now
              </h2>
              <p className="mt-1 text-sm text-muted">
                Based on what you shared. Rules change, and a caseworker may see
                things differently — it can be worth asking.
              </p>
              <ul className="mt-4 divide-y divide-line">
                {other.map((r) => (
                  <li
                    key={r.program_id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <span className="text-sm font-medium text-navy">
                        {r.program_name}
                      </span>
                      <p className="mt-0.5 max-w-md text-xs text-muted">
                        {r.reason}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* rail: action plan narrative + cliff CTA */}
        <div className="space-y-5 lg:sticky lg:top-28">
          <div className="rounded-lg border border-line bg-surface shadow-card">
            <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
              <LogoMark className="h-8 w-8" />
              <div>
                <p className="text-sm font-semibold text-navy">Your plan, in plain language</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
                  Generated · {languageByCode(profile.language).native}
                </p>
              </div>
            </div>
            <div className="max-h-[32rem] overflow-y-auto px-5 py-5">
              <ActionPlanText text={plan.action_plan_text} />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-navy p-6 text-white shadow-navy">
            <TrendingDown className="h-6 w-6 text-brass-soft" />
            <h3 className="mt-3 text-lg font-semibold text-white">
              Before you take a raise
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              See exactly where benefits drop as income rises — so more pay never
              quietly means less.
            </p>
            <ButtonLink href="/cliff" variant="brass" size="sm" className="mt-5">
              View your benefits cliff
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-navy">
              <Phone className="h-4 w-4" />
              <p className="text-sm font-semibold">Need a person?</p>
            </div>
            <p className="mt-2 text-sm text-muted">
              A local benefits navigator can help you apply. Call{" "}
              <span className="font-semibold text-navy">211</span> or visit
              findhelp.org.
            </p>
          </div>
        </div>
      </div>

      {/* disclaimer */}
      <div className="mt-8 flex items-start gap-3 rounded-md border border-line bg-paper-2 px-5 py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <p className="text-xs leading-relaxed text-muted">{plan.disclaimer}</p>
      </div>
    </div>
  );
}

function Chip({ label, mono }: { label: string; mono?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-navy ${
        mono ? "num" : ""
      }`}
    >
      {label}
    </span>
  );
}
