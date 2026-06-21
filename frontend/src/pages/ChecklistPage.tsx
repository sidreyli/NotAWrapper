import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import { ChecklistItem } from "@/components/ChecklistItem";
import { ProgramGlyph } from "@/lib/programs";
import { useAppState } from "@/state/AppState";
import { useT } from "@/i18n";

export function ChecklistPage({
  navigate,
  programId
}: {
  navigate: (path: string) => void;
  programId: string;
}) {
  const { results } = useAppState();
  const t = useT();
  const result = results.find((item) => item.program_id === programId) ?? results[0];

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <button
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-haze transition hover:text-emerald-700"
        onClick={() => navigate(`/programs/${result.program_id}`)}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("checklist.back", { program: result.program_name })}
      </button>

      <div className="mt-6 flex items-center gap-4">
        <ProgramGlyph id={result.program_id} className="h-14 w-14" iconClassName="h-7 w-7" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            {t("checklist.kicker")}
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            {t("checklist.heading", { program: result.program_name })}
          </h1>
        </div>
      </div>

      <p className="mt-5 max-w-xl leading-7 text-haze">
        {t("checklist.intro")}
      </p>

      <div className="mt-8 space-y-2.5">
        {result.required_documents.map((doc) => (
          <ChecklistItem key={doc} label={doc} />
        ))}
        <ChecklistItem label={t("checklist.extra1")} />
        <ChecklistItem label={t("checklist.extra2")} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => window.open(result.apply_url, "_blank", "noopener,noreferrer")}>
          {t("checklist.openApp")}
          <ExternalLink />
        </Button>
        <Button variant="outline" onClick={() => navigate("/results")}>
          {t("detail.back")}
        </Button>
      </div>
    </section>
  );
}
