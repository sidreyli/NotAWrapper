import type { EligibilityResult, UserProfile } from "../types/api";
import { Button } from "./Button";

export function ExplainabilityDrawer({
  result,
  profile,
  onClose
}: {
  result: EligibilityResult | null;
  profile: UserProfile;
  onClose: () => void;
}) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-dark/40" role="dialog" aria-modal="true">
      <div className="ml-auto flex h-full max-w-xl flex-col overflow-y-auto bg-surface p-6 shadow-soft">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-teal">Why this result?</p>
            <h2 className="display-heading mt-3 text-4xl text-dark">{result.program_name}</h2>
          </div>
          <button className="rounded-full border border-border px-3 py-1 text-xl" onClick={onClose} type="button">
            x
          </button>
        </div>
        <p className="text-lg leading-8 text-slate-700">{result.reason}</p>
        <section className="mt-8">
          <h3 className="mb-3 text-xl font-extrabold">Inputs used</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-muted">State</dt>
            <dd className="font-bold">{profile.state}</dd>
            <dt className="text-muted">Household</dt>
            <dd className="font-bold">{profile.household_size} people</dd>
            <dt className="text-muted">Children</dt>
            <dd className="font-bold">{profile.children_under_18}</dd>
            <dt className="text-muted">Monthly income</dt>
            <dd className="font-bold">${profile.monthly_gross_income.toLocaleString()}</dd>
          </dl>
        </section>
        <section className="mt-8">
          <h3 className="mb-3 text-xl font-extrabold">Rules checked</h3>
          <div className="space-y-3">
            {result.eligibility_factors.map((factor) => (
              <div key={factor.factor_name} className="rounded-xl bg-page p-4">
                <p className="font-bold">{factor.factor_name}</p>
                <p className="text-sm text-muted">{factor.user_value} compared with {factor.threshold}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-8 rounded-xl bg-softAqua p-5">
          <h3 className="font-extrabold">Sources</h3>
          <p className="mt-2 text-sm text-slate-700">
            {result.data_source}. Data as of {result.data_as_of}. Final eligibility is determined by the agency you apply to.
          </p>
        </section>
        <Button className="mt-8" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
