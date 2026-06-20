import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import { ChecklistItem } from "@/components/ChecklistItem";
import { ProgramGlyph } from "@/lib/programs";
import { useAppState } from "@/state/AppState";

export function ChecklistPage({
  navigate,
  programId
}: {
  navigate: (path: string) => void;
  programId: string;
}) {
  const { results } = useAppState();
  const result = results.find((item) => item.program_id === programId) ?? results[0];

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <button
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-haze transition hover:text-emerald-700"
        onClick={() => navigate(`/programs/${result.program_id}`)}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {result.program_name}
      </button>

      <div className="mt-6 flex items-center gap-4">
        <ProgramGlyph id={result.program_id} className="h-14 w-14" iconClassName="h-7 w-7" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Document checklist
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            Prepare for {result.program_name}
          </h1>
        </div>
      </div>

      <p className="mt-5 max-w-xl leading-7 text-haze">
        Check these off as you gather them. Nothing is saved to an account — this list lives only in
        your browser.
      </p>

      <div className="mt-8 space-y-2.5">
        {result.required_documents.map((doc) => (
          <ChecklistItem key={doc} label={doc} />
        ))}
        <ChecklistItem label="Write down questions for the agency or caseworker" />
        <ChecklistItem label="Save or print this action plan for your records" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => window.open(result.apply_url, "_blank", "noopener,noreferrer")}>
          Open official application
          <ExternalLink />
        </Button>
        <Button variant="outline" onClick={() => navigate("/results")}>
          Back to results
        </Button>
      </div>
    </section>
  );
}
