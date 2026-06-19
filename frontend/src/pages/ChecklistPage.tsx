import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ChecklistItem } from "../components/ChecklistItem";
import { useAppState } from "../state/AppState";

export function ChecklistPage({ navigate, programId }: { navigate: (path: string) => void; programId: string }) {
  const { results } = useAppState();
  const result = results.find((item) => item.program_id === programId) ?? results[0];

  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      <button className="mb-8 font-bold text-teal" onClick={() => navigate(`/programs/${result.program_id}`)} type="button">
        {'<-'} Back to {result.program_name}
      </button>
      <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.22em] text-teal">Document checklist</p>
      <h1 className="display-heading text-6xl text-dark">Prepare for {result.program_name}</h1>
      <p className="mt-5 max-w-3xl text-xl leading-8 text-muted">
        Check these off locally as you gather them. Nothing is saved to an account.
      </p>
      <Card className="mt-8 p-6">
        <div className="space-y-4">
          {result.required_documents.map((document) => (
            <ChecklistItem key={document} label={document} />
          ))}
          <ChecklistItem label="Write down questions for the agency or caseworker" />
          <ChecklistItem label="Save or print this action plan for your records" />
        </div>
      </Card>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => window.open(result.apply_url, "_blank", "noopener,noreferrer")}>Open official application</Button>
        <Button variant="secondary" onClick={() => navigate("/results")}>Back to results</Button>
      </div>
    </section>
  );
}
