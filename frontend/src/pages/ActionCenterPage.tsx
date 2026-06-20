import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileSearch,
  FolderOpen,
  MapPinned,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { lazy, Suspense } from "react";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Motion";
import { CHILL, ShaderBackground } from "@/components/ShaderBackground";
import { loadActionCenter } from "@/lib/actionCenterStore";
import { loadSession } from "@/lib/sessionStore";
import { cn } from "@/lib/utils";
import { CloudSyncCard } from "@/components/CloudSyncCard";

const ResourceNavigatorPage = lazy(() => import("./ResourceNavigatorPage").then((module) => ({ default: module.ResourceNavigatorPage })));
const DocumentCopilotPage = lazy(() => import("./DocumentCopilotPage").then((module) => ({ default: module.DocumentCopilotPage })));
const TimelinePage = lazy(() => import("./TimelinePage").then((module) => ({ default: module.TimelinePage })));

type Navigate = (path: string) => void;

const tools = [
  {
    id: "eligibility",
    eyebrow: "Discover",
    title: "Check what you may qualify for",
    body: "A short conversation checks published program rules and explains every result.",
    action: "Start a benefits check",
    path: "/check-eligibility",
    icon: Compass,
    tone: "emerald"
  },
  {
    id: "documents",
    eyebrow: "Understand",
    title: "Make sense of a letter or document",
    body: "Upload a notice, paystub, or utility bill. Compass finds dates, useful details, and missing paperwork.",
    action: "Review a document",
    path: "/action-center/documents",
    icon: FileSearch,
    tone: "gold"
  },
  {
    id: "resources",
    eyebrow: "Find",
    title: "Locate help near you",
    body: "Find enrollment offices, clinics, food support, and utility assistance using only a ZIP code.",
    action: "Search nearby help",
    path: "/action-center/resources",
    icon: MapPinned,
    tone: "sky"
  },
  {
    id: "timeline",
    eyebrow: "Organize",
    title: "Turn next steps into a plan",
    body: "Keep deadlines, documents, appointments, and follow-ups together, then add them to your calendar.",
    action: "Open my timeline",
    path: "/action-center/timeline",
    icon: CalendarDays,
    tone: "lilac"
  }
] as const;

const toneClasses = {
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  gold: "bg-gold-100 text-gold-600 ring-gold-300/60",
  sky: "bg-sky/10 text-sky ring-sky/20",
  lilac: "bg-lilac/10 text-lilac ring-lilac/20"
};

export function ActionCenterPage({ navigate, path }: { navigate: Navigate; path: string }) {
  if (path === "/action-center/timeline") {
    return <Suspense fallback={<ToolFallback />}><TimelinePage navigate={navigate} /></Suspense>;
  }
  if (path === "/action-center/documents") {
    return <Suspense fallback={<ToolFallback />}><DocumentCopilotPage navigate={navigate} /></Suspense>;
  }
  if (path === "/action-center/resources") {
    return <Suspense fallback={<ToolFallback />}><ResourceNavigatorPage navigate={navigate} /></Suspense>;
  }
  if (path !== "/action-center") {
    return <ActionCenterPlaceholder navigate={navigate} path={path} />;
  }

  const session = loadSession();
  const center = loadActionCenter();
  const hasResults = Boolean(session?.profile && session.results?.length);
  const preparedDocuments = center.documentAnalyses.length;
  const savedPlaces = center.savedResources.length;
  const openTasks = center.timeline?.tasks.filter((task) => !task.completed).length ?? 0;

  return (
    <div className="relative isolate overflow-hidden pb-20">
      <section className="relative isolate overflow-hidden border-b border-white/10 text-white">
        <ShaderBackground colors={CHILL} speed={0.18} distortion={0.65} swirl={0.45} />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#04130D]/35 via-transparent to-[#04130D]/75" />
        <div className="mx-auto grid max-w-6xl gap-9 px-6 py-14 sm:py-16 lg:grid-cols-[1fr_22rem] lg:items-end">
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
              <Sparkles className="h-4 w-4" />
              Your Action Center
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-light leading-[0.98] tracking-[-0.02em] text-balance sm:text-6xl">
              Start with whatever feels most urgent.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/82">
              You do not need to complete an eligibility check first. Understand a letter, find local help,
              or begin a plan now—Compass connects the pieces as you go.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                Your case file
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  [preparedDocuments, "documents"],
                  [savedPlaces, "places"],
                  [openTasks, "open tasks"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-black/12 px-3 py-3 text-center ring-1 ring-white/10">
                    <p className="font-display text-2xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-emerald-50/60">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-emerald-50/70">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                Stored only in this browser and cleared with your session.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <Reveal className="mb-6 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Choose a starting point</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">What do you need today?</h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-haze sm:block">
              Each tool works on its own. Using more of them makes your plan more specific.
            </p>
          </Reveal>

          <div className="overflow-hidden rounded-[2rem] border border-border bg-paper shadow-soft">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => navigate(tool.path)}
                  className={cn(
                    "group grid w-full gap-4 px-5 py-6 text-left transition hover:bg-emerald-50/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center sm:px-7",
                    index > 0 && "border-t border-border"
                  )}
                >
                  <span className={cn("grid h-14 w-14 place-items-center rounded-2xl ring-1", toneClasses[tool.tone])}>
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-haze">{tool.eyebrow}</span>
                    <span className="mt-1 block font-display text-[1.35rem] font-semibold leading-tight text-ink">
                      {tool.title}
                    </span>
                    <span className="mt-2 block max-w-2xl text-sm leading-6 text-haze">{tool.body}</span>
                  </span>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 sm:mt-0">
                    {tool.action}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.12} className="space-y-4 lg:sticky lg:top-24">
          <aside className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-b from-mint/70 to-paper p-6 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-soft">
              {hasResults ? <CheckCircle2 className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
            </span>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Suggested next move</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
              {hasResults ? "Bring your results into a real plan." : "Tell Compass what is pressing."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-haze">
              {hasResults
                ? "Your eligibility results are ready. Add a document or nearby location to make the next steps concrete."
                : "If you have a letter with a deadline, begin there. Otherwise, the benefits check takes about three minutes."}
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => navigate(hasResults ? "/action-center/documents" : "/check-eligibility")}
            >
              {hasResults ? <ClipboardCheck /> : <Compass />}
              {hasResults ? "Add a document" : "Start benefits check"}
            </Button>
          </aside>
          <CloudSyncCard />
        </Reveal>
      </section>
    </div>
  );
}

function ToolFallback() {
  return <div className="grid min-h-[65vh] place-items-center bg-canvas"><span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" /></div>;
}

function ActionCenterPlaceholder({ navigate, path }: { navigate: Navigate; path: string }) {
  const segments = path.split("/").filter(Boolean);
  const label = segments[segments.length - 1]?.replace(/-/g, " ") ?? "tool";
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <button
        type="button"
        onClick={() => navigate("/action-center")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Action Center
      </button>
      <div className="mt-8 rounded-[2rem] border border-border bg-paper p-10 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Action Center</p>
        <h1 className="mt-3 font-display text-4xl font-semibold capitalize text-ink">{label}</h1>
        <p className="mt-4 text-haze">This tool is the next feature slice being connected.</p>
      </div>
    </section>
  );
}
