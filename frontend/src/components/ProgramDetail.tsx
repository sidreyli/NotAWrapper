import type { EligibilityResult } from "../types/api";
import { Button } from "./Button";
import { Card } from "./Card";
import { ChecklistItem } from "./ChecklistItem";
import { StatusPill } from "./StatusPill";

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
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <button className="mb-8 font-bold text-teal" onClick={onBack} type="button">
        {'<-'} Back to results
      </button>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="display-heading text-6xl text-dark">{result.program_name}</h1>
        <StatusPill status={result.status} />
      </div>
      <p className="max-w-3xl text-xl leading-8 text-muted">{result.reason}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => window.open(result.apply_url, "_blank", "noopener,noreferrer")}>Apply here</Button>
        <Button variant="secondary" onClick={onChecklist}>Prepare documents</Button>
        <Button variant="ghost" onClick={onExplain}>Why this result?</Button>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-7">
          <h2 className="mb-5 font-display text-3xl font-black text-dark">Rules checked</h2>
          <div className="space-y-4">
            {result.eligibility_factors.map((factor) => (
              <div key={factor.factor_name} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-extrabold">{factor.factor_name}</h3>
                  <span className={factor.passes ? "font-bold text-success" : "font-bold text-muted"}>
                    {factor.passes ? "Passes" : "Review"}
                  </span>
                </div>
                <p className="mt-2 text-muted">You: {factor.user_value}</p>
                <p className="text-muted">Rule: {factor.threshold}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-7">
          <h2 className="mb-5 font-display text-3xl font-black text-dark">Documents needed</h2>
          <div className="space-y-3">
            {result.required_documents.slice(0, 4).map((document) => (
              <ChecklistItem key={document} label={document} />
            ))}
          </div>
        </Card>
      </div>
      <p className="mt-8 text-sm text-muted">
        Source: {result.data_source}. Data as of {result.data_as_of}. Final eligibility is determined by the agency.
      </p>
    </section>
  );
}
