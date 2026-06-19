"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingDown, AlertTriangle, ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CliffChart } from "@/components/cliff-chart";
import { Reveal } from "@/components/ui/reveal";
import { useApp } from "@/lib/store";
import { calculateCliff } from "@/lib/api";
import { MOCK_PROFILE, MOCK_CLIFF } from "@/lib/mock";
import type { CliffResponse } from "@/lib/types";
import { STATE_NAMES } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const MAX_OPTIONS = [4000, 5000, 7000, 10000];

export default function CliffPage() {
  const { profile: storeProfile } = useApp();
  const profile = storeProfile ?? MOCK_PROFILE;

  const [data, setData] = useState<CliffResponse>(MOCK_CLIFF);
  const [maxIncome, setMaxIncome] = useState(5000);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (max: number) => {
      setLoading(true);
      try {
        const res = await calculateCliff(profile, max, 50);
        setData(res);
      } finally {
        setLoading(false);
      }
    },
    [profile]
  );

  useEffect(() => {
    load(maxIncome);
  }, [load, maxIncome]);

  const current = data.data_points.reduce(
    (best, p) =>
      Math.abs(p.monthly_income - profile.monthly_gross_income) <
      Math.abs(best.monthly_income - profile.monthly_gross_income)
        ? p
        : best,
    data.data_points[0]
  );

  const peak = data.data_points.reduce(
    (m, p) => (p.net_resources > m.net_resources ? p : m),
    data.data_points[0]
  );

  return (
    <div className="container-page py-10 lg:py-14">
      <Reveal>
        <div className="flex items-center gap-2.5">
          <p className="eyebrow">Benefits cliff</p>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
            {STATE_NAMES[profile.state] ?? profile.state} · Household {profile.household_size}
          </span>
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl text-balance">
          How your resources change as you earn more
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted">
          Each point adds your income and the value of every benefit you&apos;d
          still receive at that income. Where the line drops, a benefit ends
          faster than your pay makes up for it — a cliff.
        </p>
      </Reveal>

      {/* stat strip */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Your resources now"
          value={formatMoney(current.net_resources)}
          sub={`at ${formatMoney(current.monthly_income)}/mo income`}
          tone="navy"
        />
        <StatTile
          label="Benefits stacked in"
          value={formatMoney(current.total_benefit_value)}
          sub="added on top of your pay"
        />
        <StatTile
          label="Cliffs ahead"
          value={String(data.cliff_zones.length)}
          sub="income points to watch"
          tone={data.cliff_zones.length > 0 ? "warn" : undefined}
        />
      </div>

      {/* chart */}
      <Reveal>
        <div className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">
                Net monthly resources
              </h2>
              <p className="text-sm text-muted">Hover anywhere to see the breakdown.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
                Chart up to
              </span>
              <div className="inline-flex rounded-md border border-line bg-paper p-0.5">
                {MAX_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaxIncome(m)}
                    className={`rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      maxIncome === m
                        ? "bg-navy text-white"
                        : "text-muted hover:text-navy"
                    }`}
                  >
                    ${m / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <CliffChart
              key={maxIncome}
              points={data.data_points}
              zones={data.cliff_zones}
              currentIncome={profile.monthly_gross_income}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-xs text-muted">
            <Legend swatch="bg-navy" label="Net resources" />
            <Legend dashed label="Income alone" />
            <Legend swatch="bg-brass" label="You, now" />
            <Legend swatch="bg-[#b65a1c]/70" label="Cliff zone" />
            <span className="ml-auto num text-faint">
              Peak resources {formatMoney(peak.net_resources)} at {formatMoney(peak.monthly_income)}/mo
            </span>
          </div>
        </div>
      </Reveal>

      {/* cliff zones */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-navy">
          {data.cliff_zones.length > 0 ? "Where to be careful" : "No sharp cliffs detected"}
        </h2>
        {data.cliff_zones.length === 0 ? (
          <p className="mt-3 max-w-xl text-sm text-muted">
            Across this income range, your resources rise fairly steadily. Keep
            an eye on renewals, but there&apos;s no single point where earning
            more leaves you worse off.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.cliff_zones.map((z, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="flex h-full gap-4 rounded-lg border border-line bg-surface p-5 shadow-xs">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-review-wash text-review">
                    <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="num text-sm font-semibold text-navy">
                        {formatMoney(z.income_start)}–{formatMoney(z.income_end)}/mo
                      </span>
                      <span className="num rounded-full bg-review-wash px-2 py-0.5 text-[0.7rem] font-medium text-review">
                        {formatMoney(z.net_change)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {z.description}
                    </p>
                    <p className="mt-2 text-xs text-faint">
                      Benefit lost: {z.benefit_lost}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-paper-2 px-6 py-5">
        <div className="flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-brass" />
          <p className="max-w-lg text-sm text-muted">
            Planning a raise or new job? Bring this to your caseworker — small
            timing changes can keep you above the cliff.
          </p>
        </div>
        <ButtonLink href="/results" variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </ButtonLink>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "navy" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        tone === "navy"
          ? "border-navy bg-navy text-white"
          : tone === "warn"
          ? "border-review/30 bg-review-wash"
          : "border-line bg-surface"
      }`}
    >
      <p
        className={`font-mono text-[0.62rem] uppercase tracking-[0.14em] ${
          tone === "navy" ? "text-white/50" : "text-faint"
        }`}
      >
        {label}
      </p>
      <p
        className={`num mt-2 text-3xl font-semibold tracking-tight ${
          tone === "navy" ? "text-white" : "text-navy"
        }`}
      >
        {value}
      </p>
      <p className={`mt-1 text-sm ${tone === "navy" ? "text-white/60" : "text-muted"}`}>
        {sub}
      </p>
    </div>
  );
}

function Legend({
  swatch,
  label,
  dashed,
}: {
  swatch?: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {dashed ? (
        <span className="inline-block h-0.5 w-4 bg-navy-300" />
      ) : (
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${swatch}`} />
      )}
      {label}
    </span>
  );
}
