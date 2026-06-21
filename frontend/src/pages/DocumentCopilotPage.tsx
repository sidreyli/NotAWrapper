import { ChangeEvent, DragEvent, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileSearch,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  X
} from "lucide-react";
import { Button } from "@/components/Button";
import { analyzeDocument } from "@/lib/api";
import { loadActionCenter, saveActionCenter } from "@/lib/actionCenterStore";
import { PROGRAMS } from "@/lib/programs";
import { loadSession } from "@/lib/sessionStore";
import { cn } from "@/lib/utils";
import { useT, type MessageKey } from "@/i18n";
import type { DocumentAnalysis } from "@/types/api";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function DocumentCopilotPage({ navigate }: { navigate: (path: string) => void }) {
  const t = useT();
  const likelyPrograms = (loadSession()?.results ?? [])
    .filter((result) => result.status === "likely_eligible" || result.status === "possibly_eligible")
    .map((result) => result.program_id);
  const [programIds, setProgramIds] = useState<string[]>(likelyPrograms.length ? likelyPrograms : ["snap"]);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [acceptedFields, setAcceptedFields] = useState<Set<string>>(new Set());
  const [acceptedDeadlines, setAcceptedDeadlines] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chooseFile = (next: File | undefined) => {
    if (!next) return;
    if (!allowedTypes.includes(next.type)) {
      setError(t("doc.errType"));
      return;
    }
    if (next.size > 4 * 1024 * 1024) {
      setError(t("doc.errSize"));
      return;
    }
    setError("");
    setFile(next);
    setAnalysis(null);
    setSaved(false);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const runAnalysis = async () => {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const result = await analyzeDocument(file, programIds);
      setAnalysis(result);
      setAcceptedFields(new Set(result.fields.filter((field) => field.confidence >= 0.75).map((field) => field.key)));
      setAcceptedDeadlines(new Set(result.deadlines.map((_, index) => index)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("doc.errAnalyze"));
    } finally {
      setLoading(false);
    }
  };

  const saveReview = () => {
    if (!analysis) return;
    const reviewed = {
      ...analysis,
      accepted_fields: [...acceptedFields],
      accepted_deadlines: [...acceptedDeadlines]
    };
    const current = loadActionCenter();
    const others = current.documentAnalyses.filter((item) => item.id !== reviewed.id);
    saveActionCenter({ documentAnalyses: [...others, reviewed] });
    setAnalysis(reviewed);
    setSaved(true);
  };

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setSaved(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas pb-20">
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-9">
          <button type="button" onClick={() => navigate("/action-center")} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
            <ArrowLeft className="h-4 w-4" /> {t("ac.backToCenter")}
          </button>
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-600"><FileSearch className="h-4 w-4" /> {t("doc.kicker")}</p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t("doc.heading")}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-haze">{t("doc.subtitle")}</p>
            </div>
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-mint/50 px-5 py-3 text-sm text-haze"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t("doc.privacyBadge")}</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {!analysis ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
            <section className="rounded-[2rem] border border-border bg-paper p-6 shadow-soft sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-haze">{t("doc.step1")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.keys(PROGRAMS).map((id) => {
                    const active = programIds.includes(id);
                    return <button key={id} type="button" onClick={() => setProgramIds((current) => active ? current.filter((value) => value !== id) : [...current, id])} className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition", active ? "border-emerald-500 bg-emerald-600 text-white" : "border-border bg-canvas text-haze hover:border-emerald-200")}><span className="mr-1.5 uppercase">{id}</span><span className="hidden sm:inline">· {t(`program.${id}.category` as MessageKey)}</span></button>;
                  })}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-haze">{t("doc.step2")}</p>
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onInput} className="hidden" />
                <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={cn("mt-4 rounded-[1.75rem] border-2 border-dashed p-10 text-center transition sm:p-14", dragging ? "border-gold-500 bg-gold-50" : "border-gold-300/60 bg-gold-50/40")}>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-paper text-gold-600 shadow-soft"><UploadCloud className="h-6 w-6" /></span>
                  {file ? <><h2 className="mt-5 font-display text-xl font-semibold text-ink">{file.name}</h2><p className="mt-2 text-sm text-haze">{t("doc.readyToReview", { size: (file.size / 1024 / 1024).toFixed(2) })}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={runAnalysis} disabled={loading || programIds.length === 0}>{loading ? <Loader2 className="animate-spin" /> : <FileSearch />}{loading ? t("doc.reading") : t("doc.analyze")}</Button><Button variant="outline" onClick={reset}><X />{t("doc.remove")}</Button></div></> : <><h2 className="mt-5 font-display text-xl font-semibold text-ink">{t("doc.dropHere")}</h2><p className="mt-2 text-sm text-haze">{t("doc.fileHint")}</p><Button variant="outline" className="mt-6" onClick={() => inputRef.current?.click()}><UploadCloud />{t("doc.chooseFile")}</Button></>}
                </div>
              </div>
              {error && <p className="mt-4 flex items-start gap-2 rounded-xl bg-clay/10 p-4 text-sm font-medium text-clay" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
            </section>

            <aside className="rounded-[2rem] border border-emerald-100 bg-gradient-to-b from-mint/70 to-paper p-6 shadow-soft">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink">{t("doc.controlTitle")}</h2>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-haze">{[t("doc.control1"), t("doc.control2"), t("doc.control3"), t("doc.control4")].map((item) => <li key={item} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>
            </aside>
          </div>
        ) : (
          <AnalysisReview analysis={analysis} acceptedFields={acceptedFields} acceptedDeadlines={acceptedDeadlines} setAcceptedFields={setAcceptedFields} setAcceptedDeadlines={setAcceptedDeadlines} saved={saved} onSave={saveReview} onReset={reset} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

function AnalysisReview({ analysis, acceptedFields, acceptedDeadlines, setAcceptedFields, setAcceptedDeadlines, saved, onSave, onReset, navigate }: {
  analysis: DocumentAnalysis;
  acceptedFields: Set<string>;
  acceptedDeadlines: Set<number>;
  setAcceptedFields: (value: Set<string>) => void;
  setAcceptedDeadlines: (value: Set<number>) => void;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
  navigate: (path: string) => void;
}) {
  const t = useT();
  const matches = analysis.checklist_matches.filter((item) => item.status !== "missing");
  return <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-gold-300/50 bg-gradient-to-br from-gold-50 to-paper p-7 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">{t("doc.found")}</p><h2 className="mt-2 font-display text-3xl font-semibold text-ink">{analysis.document_type}</h2><p className="mt-3 max-w-2xl leading-7 text-haze">{analysis.summary}</p></div><span className="rounded-full bg-paper px-3 py-1.5 text-xs font-bold text-haze shadow-sm">{analysis.file_name}</span></div>
      </div>

      {analysis.deadlines.length > 0 && <ReviewSection title={t("doc.datesTitle")} icon={<CalendarClock />}><div className="space-y-3">{analysis.deadlines.map((deadline, index) => { const active = acceptedDeadlines.has(index); return <button key={`${deadline.label}-${index}`} type="button" onClick={() => { const next = new Set(acceptedDeadlines); active ? next.delete(index) : next.add(index); setAcceptedDeadlines(next); }} className={cn("flex w-full gap-4 rounded-2xl border p-4 text-left", active ? "border-emerald-300 bg-emerald-50" : "border-border bg-canvas")}><span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border", active ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-paper text-transparent")}><Check className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-ink">{deadline.label}</strong><span className="font-display text-lg font-semibold text-emerald-700">{deadline.date ?? t("doc.dateUnclear")}</span></span><span className="mt-2 block text-sm italic text-haze">“{deadline.evidence}”{deadline.page ? t("doc.pageSuffix", { page: deadline.page }) : ""}</span></span></button>; })}</div></ReviewSection>}

      <ReviewSection title={t("doc.detailsTitle")} icon={<FileCheck2 />}><div className="grid gap-3 sm:grid-cols-2">{analysis.fields.map((field) => { const active = acceptedFields.has(field.key); return <button key={field.key} type="button" onClick={() => { const next = new Set(acceptedFields); active ? next.delete(field.key) : next.add(field.key); setAcceptedFields(next); }} className={cn("rounded-2xl border p-4 text-left transition", active ? "border-emerald-300 bg-emerald-50" : "border-border bg-canvas")}><span className="flex items-start justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wide text-haze">{field.label}</span>{field.sensitive && <Lock className="h-3.5 w-3.5 text-gold-600" />}</span><strong className="mt-2 block break-words text-ink">{field.value}</strong><span className="mt-3 block text-xs italic leading-5 text-haze">“{field.evidence}”</span><span className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><span className={cn("grid h-4 w-4 place-items-center rounded-full", active ? "bg-emerald-600 text-white" : "border border-border text-transparent")}><Check className="h-2.5 w-2.5" /></span>{active ? t("doc.confirmed") : t("doc.notConfirmed")} · {t("doc.confidence", { percent: Math.round(field.confidence * 100) })}</span></button>; })}</div></ReviewSection>

      {matches.length > 0 && <ReviewSection title={t("doc.matchesTitle")} icon={<CheckCircle2 />}><div className="space-y-2">{matches.map((match) => <div key={`${match.program_id}-${match.requirement}`} className="rounded-2xl border border-border bg-canvas p-4"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{match.program_id}</span><strong className="text-sm text-ink">{match.requirement}</strong></div><p className="mt-2 text-sm leading-6 text-haze">{match.reason}</p></div>)}</div></ReviewSection>}
    </section>

    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-paper p-6 shadow-soft"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t("doc.reviewSummary")}</p><div className="mt-5 grid grid-cols-2 gap-2"><Stat value={acceptedFields.size} label={t("doc.detailsConfirmed")} /><Stat value={acceptedDeadlines.size} label={t("doc.datesAccepted")} /></div><Button className="mt-5 w-full" onClick={onSave}>{saved ? <CheckCircle2 /> : <FileCheck2 />}{saved ? t("doc.savedToFile") : t("doc.saveReviewed")}</Button>{saved && <Button variant="soft" className="mt-2 w-full" onClick={() => navigate("/action-center/timeline")}><CalendarClock />{t("doc.buildTimeline")}</Button>}<p className="mt-4 text-xs leading-5 text-haze">{t("doc.saveNote")}</p></div>
      <Button variant="outline" className="w-full" onClick={onReset}><RotateCcw />{t("doc.reviewAnother")}</Button>
      {analysis.warnings.length > 0 && <details className="rounded-2xl border border-gold-300/40 bg-gold-50 p-4"><summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-ink">{t("doc.doubleCheck")} <ChevronDown className="h-4 w-4" /></summary><ul className="mt-3 space-y-2 text-xs leading-5 text-haze">{analysis.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></details>}
    </aside>
  </div>;
}

function ReviewSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-[2rem] border border-border bg-paper p-6 shadow-soft sm:p-7"><h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-semibold text-ink"><span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-emerald-700 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>{title}</h2>{children}</section>; }
function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-mint/60 p-3 text-center"><p className="font-display text-2xl font-semibold text-emerald-700">{value}</p><p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-wide text-haze">{label}</p></div>; }
