import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  FileCheck2,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/Button";
import { buildTimeline, createCalendarEvents, getCalendarAuthorization, getCalendarStatus } from "@/lib/api";
import { loadActionCenter, saveActionCenter } from "@/lib/actionCenterStore";
import { downloadTimeline } from "@/lib/calendarExport";
import { PROGRAMS } from "@/lib/programs";
import { loadSession } from "@/lib/sessionStore";
import { cn } from "@/lib/utils";
import { useT, type MessageKey } from "@/i18n";
import type { ActionTask, ActionTimeline, DocumentAnalysis } from "@/types/api";

function dateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function TimelinePage({ navigate }: { navigate: (path: string) => void }) {
  const t = useT();
  const initialCenter = loadActionCenter();
  const likely = (loadSession()?.results ?? []).filter((result) => result.status === "likely_eligible" || result.status === "possibly_eligible").map((result) => result.program_id);
  const [programIds, setProgramIds] = useState<string[]>(likely);
  const [targetDate, setTargetDate] = useState(dateAfter(7));
  const [timeline, setTimeline] = useState<ActionTimeline | null>(initialCenter.timeline);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set(initialCenter.timeline?.tasks.filter((task) => !task.completed).map((task) => task.id) ?? []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarConfigured, setCalendarConfigured] = useState(false);
  const initialCalendarQuery = new URLSearchParams(window.location.search);
  const [calendarCode, setCalendarCode] = useState<string | null>(() => initialCalendarQuery.get("calendar_code"));
  const [calendarState, setCalendarState] = useState<string | null>(() => initialCalendarQuery.get("calendar_state"));
  const [calendarMessage, setCalendarMessage] = useState("");

  const center = loadActionCenter();
  const acceptedAnalyses = useMemo(() => center.documentAnalyses.map((analysis) => ({
    ...analysis,
    fields: analysis.fields.filter((field) => !analysis.accepted_fields || analysis.accepted_fields.includes(field.key)),
    deadlines: analysis.deadlines.filter((_, index) => !analysis.accepted_deadlines || analysis.accepted_deadlines.includes(index))
  })), [center.savedAt]);

  useEffect(() => {
    getCalendarStatus().then((status) => setCalendarConfigured(status.configured)).catch(() => setCalendarConfigured(false));
    const query = new URLSearchParams(window.location.search);
    const code = query.get("calendar_code");
    const state = query.get("calendar_state");
    const calendarError = query.get("calendar_error");
    if (code && state) {
      setCalendarCode(code);
      setCalendarState(state);
      setCalendarMessage(t("tl.gcalConnected"));
      window.history.replaceState({}, "", "/action-center/timeline");
    } else if (calendarError) {
      setCalendarMessage(t("tl.gcalNotConnected"));
      window.history.replaceState({}, "", "/action-center/timeline");
    }
  }, []);

  const generate = async () => {
    if (!programIds.length && !acceptedAnalyses.some((analysis) => analysis.deadlines.length)) {
      setError(t("tl.errNoInput"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const generated = await buildTimeline({
        program_ids: programIds,
        document_analyses: acceptedAnalyses as DocumentAnalysis[],
        selected_resources: center.savedResources.slice(0, 1),
        target_date: targetDate
      });
      setTimeline(generated);
      setSelectedTaskIds(new Set(generated.tasks.map((task) => task.id)));
      saveActionCenter({ timeline: generated });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tl.errBuild"));
    } finally {
      setLoading(false);
    }
  };

  const updateTasks = (tasks: ActionTask[]) => {
    if (!timeline) return;
    const next = { ...timeline, tasks };
    setTimeline(next);
    saveActionCenter({ timeline: next });
  };

  const connectCalendar = async () => {
    setCalendarMessage("");
    try {
      const result = await getCalendarAuthorization();
      if (result.authorization_url) window.location.assign(result.authorization_url);
      else setCalendarMessage(t("tl.gcalNotConfigured"));
    } catch {
      setCalendarMessage(t("tl.gcalConnectError"));
    }
  };

  const syncCalendar = async () => {
    if (!calendarCode || !calendarState || !timeline) return;
    const selected = timeline.tasks.filter((task) => selectedTaskIds.has(task.id));
    setLoading(true);
    try {
      const result = await createCalendarEvents(calendarCode, calendarState, selected);
      const added = t(result.created === 1 ? "tl.gcalAddedOne" : "tl.gcalAddedOther", { count: result.created });
      const skipped = result.skipped ? t("tl.gcalSkipped", { count: result.skipped }) : "";
      const failed = result.errors.length ? t("tl.gcalFailed", { count: result.errors.length }) : "";
      setCalendarMessage(`${added}${skipped}${failed}.`);
      setCalendarCode(null);
      setCalendarState(null);
    } catch (err) {
      setCalendarMessage(err instanceof Error ? err.message : t("tl.gcalCreateError"));
      setCalendarCode(null);
      setCalendarState(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedTasks = timeline?.tasks.filter((task) => selectedTaskIds.has(task.id)) ?? [];

  return <div className="min-h-[calc(100vh-4rem)] bg-canvas pb-20">
    <section className="border-b border-border bg-paper"><div className="mx-auto max-w-6xl px-6 py-9"><button type="button" onClick={() => navigate("/action-center")} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ArrowLeft className="h-4 w-4" />{t("ac.backToCenter")}</button><div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-lilac"><CalendarDays className="h-4 w-4" />{t("tl.kicker")}</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t("tl.heading")}</h1><p className="mt-4 max-w-2xl leading-7 text-haze">{t("tl.subtitle")}</p></div>{timeline && <Button variant="outline" onClick={() => setTimeline(null)}><RefreshCw />{t("tl.rebuild")}</Button>}</div></div></section>

    <div className="mx-auto max-w-6xl px-6 py-8">
      {!timeline ? <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start"><section className="rounded-[2rem] border border-border bg-paper p-7 shadow-soft"><p className="text-xs font-bold uppercase tracking-[0.16em] text-haze">{t("tl.includeQ")}</p><div className="mt-5 flex flex-wrap gap-2">{Object.entries(PROGRAMS).map(([id]) => { const active = programIds.includes(id); return <button key={id} type="button" onClick={() => setProgramIds((current) => active ? current.filter((value) => value !== id) : [...current, id])} className={cn("rounded-full border px-4 py-2 text-sm font-bold uppercase transition", active ? "border-lilac bg-lilac text-white" : "border-border bg-canvas text-haze")}>{id}</button>; })}</div><label className="mt-8 block"><span className="text-xs font-bold uppercase tracking-[0.16em] text-haze">{t("tl.whenQ")}</span><input type="date" min={dateAfter(0)} value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="mt-3 h-12 w-full max-w-xs rounded-xl border border-border bg-canvas px-4 font-semibold text-ink outline-none focus:border-lilac" /></label><div className="mt-8 grid gap-3 sm:grid-cols-2"><InputSummary icon={<FileCheck2 />} value={acceptedAnalyses.length} label={t("tl.reviewedDocs")} detail={t("tl.confirmedDates", { count: acceptedAnalyses.reduce((sum, item) => sum + item.deadlines.length, 0) })} /><InputSummary icon={<MapPin />} value={center.savedResources.length} label={t("tl.savedLocations")} detail={center.savedResources[0]?.name ?? t("tl.noLocation")} /></div>{error && <p className="mt-5 rounded-xl bg-clay/10 p-4 text-sm font-medium text-clay">{error}</p>}<Button size="lg" className="mt-7" onClick={generate} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Sparkles />}{loading ? t("tl.building") : t("tl.build")}</Button></section><aside className="rounded-[2rem] border border-lilac/15 bg-lilac/5 p-6"><CalendarCheck2 className="h-7 w-7 text-lilac" /><h2 className="mt-5 font-display text-2xl font-semibold text-ink">{t("tl.datesHonest")}</h2><div className="mt-5 space-y-4"><Legend color="bg-gold-500" title={t("tl.source.extracted")} body={t("tl.legend.extractedBody")} /><Legend color="bg-emerald-500" title={t("tl.source.official")} body={t("tl.legend.officialBody")} /><Legend color="bg-lilac" title={t("tl.source.suggested")} body={t("tl.legend.suggestedBody")} /></div></aside></div> : <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start"><section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-lilac">{t("tl.workingPlan")}</p><h2 className="mt-1 font-display text-3xl font-semibold text-ink">{t("tl.nextSteps", { count: timeline.tasks.length })}</h2></div><p className="text-sm text-haze">{t("tl.completedCount", { count: timeline.tasks.filter((task) => task.completed).length })}</p></div><div className="space-y-3">{timeline.tasks.map((task) => <TaskRow key={task.id} task={task} selected={selectedTaskIds.has(task.id)} onSelect={() => { const next = new Set(selectedTaskIds); next.has(task.id) ? next.delete(task.id) : next.add(task.id); setSelectedTaskIds(next); }} onComplete={() => updateTasks(timeline.tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} onDate={(date) => updateTasks(timeline.tasks.map((item) => item.id === task.id ? { ...item, due_at: date, date_source: "suggested" } : item))} />)}</div></section><aside className="space-y-4 lg:sticky lg:top-24"><div className="rounded-[1.75rem] border border-border bg-paper p-6 shadow-soft"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t("tl.calendar")}</p><h2 className="mt-2 font-display text-2xl font-semibold text-ink">{t("tl.keepMoving")}</h2><p className="mt-3 text-sm leading-6 text-haze">{t(selectedTasks.length === 1 ? "tl.selectedTasksOne" : "tl.selectedTasksOther", { count: selectedTasks.length })}</p><Button variant="outline" className="mt-5 w-full" onClick={() => downloadTimeline(selectedTasks)} disabled={!selectedTasks.length}><Download />{t("tl.download")}</Button>{calendarCode && calendarState ? <Button className="mt-2 w-full" onClick={syncCalendar} disabled={loading || !selectedTasks.length}>{loading ? <Loader2 className="animate-spin" /> : <CalendarCheck2 />}{t("tl.confirmGcal")}</Button> : <Button variant="soft" className="mt-2 w-full" onClick={connectCalendar}>{calendarConfigured ? <CalendarDays /> : <ExternalLink />}{calendarConfigured ? t("tl.connectGcal") : t("tl.calendarSetup")}</Button>}{calendarMessage && <p className="mt-4 rounded-xl bg-mint p-3 text-xs leading-5 text-haze">{calendarMessage}</p>}<p className="mt-4 text-[11px] leading-5 text-haze">{t("tl.calendarNote")}</p></div><Button variant="outline" className="w-full" onClick={() => navigate("/action-center/resources")}><Building2 />{t("tl.reviewPlaces")}</Button></aside></div>}
    </div>
  </div>;
}

function InputSummary({ icon, value, label, detail }: { icon: React.ReactNode; value: number; label: string; detail: string }) { return <div className="rounded-2xl border border-border bg-canvas p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-paper text-emerald-700 shadow-sm [&>svg]:h-4 [&>svg]:w-4">{icon}</span><div><p className="font-display text-xl font-semibold text-ink">{value} <span className="font-sans text-xs font-bold uppercase text-haze">{label}</span></p><p className="mt-1 truncate text-xs text-haze">{detail}</p></div></div></div>; }
function Legend({ color, title, body }: { color: string; title: string; body: string }) { return <div className="flex gap-3"><span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", color)} /><div><p className="text-sm font-bold text-ink">{title}</p><p className="mt-1 text-xs leading-5 text-haze">{body}</p></div></div>; }

const sourceStyles = { extracted: "bg-gold-100 text-gold-600", official: "bg-emerald-100 text-emerald-700", suggested: "bg-lilac/10 text-lilac" };
function TaskRow({ task, selected, onSelect, onComplete, onDate }: { task: ActionTask; selected: boolean; onSelect: () => void; onComplete: () => void; onDate: (date: string) => void }) { const t = useT(); return <article className={cn("grid gap-4 rounded-2xl border bg-paper p-5 shadow-soft transition sm:grid-cols-[auto_1fr_auto] sm:items-start", task.completed ? "border-border opacity-60" : "border-border", selected && "ring-2 ring-emerald-100")}><button type="button" onClick={onComplete} className="mt-0.5 text-emerald-600" aria-label={task.completed ? t("tl.markIncomplete") : t("tl.markComplete")}>{task.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}</button><div><div className="flex flex-wrap items-center gap-2"><h3 className={cn("font-display text-lg font-semibold text-ink", task.completed && "line-through")}>{task.title}</h3>{task.program_id && <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-bold uppercase text-haze">{task.program_id}</span>}<span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", sourceStyles[task.date_source])}>{t(`tl.source.${task.date_source}` as MessageKey)}</span></div><p className="mt-2 text-sm leading-6 text-haze">{task.description}</p>{task.location && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-haze"><MapPin className="h-3.5 w-3.5" />{task.location}</p>}</div><div className="flex items-center gap-3 sm:flex-col sm:items-end"><input type="date" value={task.due_at.slice(0, 10)} onChange={(event) => onDate(event.target.value)} className="rounded-lg border border-border bg-canvas px-3 py-2 text-xs font-bold text-ink" /><button type="button" onClick={onSelect} className={cn("flex items-center gap-1.5 text-xs font-bold", selected ? "text-emerald-700" : "text-haze")}><span className={cn("grid h-4 w-4 place-items-center rounded border", selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-transparent")}><Check className="h-2.5 w-2.5" /></span>{selected ? t("tl.selected") : t("tl.select")}</button></div></article>; }
