import type { ReactNode } from "react";
import { Check, ListChecks, Maximize2, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import type { ActionPlanResponse } from "@/types/api";
import { useT, type TFunction } from "@/i18n";
import { cn } from "@/lib/utils";

type Meta = Array<{ label: string; value: string }>;

const STATE_NAMES: Record<string, string> = {
  CA: "California",
  TX: "Texas",
  NY: "New York",
  FL: "Florida",
  IL: "Illinois"
};

// Collapse the long markdown plan into a one-glance teaser for the summary card.
function planSummary(markdown: string): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = plain.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return plain.slice(0, 200);
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > 230) break;
    out += s;
  }
  return (out || sentences[0]).trim();
}

function preparedForLabel(plan: ActionPlanResponse, t: TFunction): string | null {
  const p = plan.profile as Partial<ActionPlanResponse["profile"]> | undefined;
  if (!p || !p.household_size) return null;
  const where = p.state ? STATE_NAMES[p.state] ?? p.state : null;
  const household = t("plan.household", { count: p.household_size });
  return where ? `${household} · ${where}` : household;
}

export function ActionPlanCard({
  actionPlan,
  meta = [],
  headless = false,
  className
}: {
  actionPlan: ActionPlanResponse;
  meta?: Meta;
  headless?: boolean;
  className?: string;
}) {
  const t = useT();
  const summary = planSummary(actionPlan.action_plan_text);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border border-emerald-100 bg-paper p-6 shadow-soft",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-mint/70 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        {!headless && (
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-white shadow-soft">
              <ListChecks className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                {t("plan.kicker")}
              </p>
              <h2 className="font-display text-xl font-semibold text-ink">{t("plan.cardTitle")}</h2>
            </div>
          </div>
        )}

        <p className={cn("text-[0.97rem] leading-7 text-haze", !headless && "mt-4")}>{summary}</p>

        {meta.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {meta.map((m) => (
              <div key={m.label} className="rounded-2xl border border-emerald-100 bg-mint/40 px-4 py-3">
                <p className="font-display text-lg font-semibold leading-none text-emerald-700">
                  {m.value}
                </p>
                <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-haze">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" variant="primary" className="mt-6 w-full">
              <Maximize2 />
              {t("plan.openFull")}
            </Button>
          </DialogTrigger>
          <PlanModal actionPlan={actionPlan} meta={meta} />
        </Dialog>
      </div>
    </article>
  );
}

function PlanSectionHeading({ children }: { children?: ReactNode }) {
  return (
    <h2 className="mt-10 flex items-start gap-3 border-t border-emerald-100 pt-7">
      <span
        className="mt-1.5 h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-700"
        aria-hidden
      />
      <span className="font-display text-[1.5rem] font-semibold leading-snug text-emerald-900">
        {children}
      </span>
    </h2>
  );
}

// The plan reads like a prepared document: a serif lead, program entries set off
// by hairline rules, emerald field labels, and documents as a real checklist.
const planComponents: Parameters<typeof ReactMarkdown>[0]["components"] = {
  h1: ({ children }) => <PlanSectionHeading>{children}</PlanSectionHeading>,
  h2: ({ children }) => <PlanSectionHeading>{children}</PlanSectionHeading>,
  h3: ({ children }) => (
    <h3 className="mt-7 font-display text-lg font-semibold text-ink">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-3 leading-8 text-ink/85">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-emerald-800">{children}</strong>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mt-4 grid gap-2.5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 grid gap-2.5">{children}</ol>,
  li: ({ children }) => (
    <li className="flex gap-3 leading-7 text-ink/85">
      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 border-emerald-300 pl-4 italic text-ink/70">
      {children}
    </blockquote>
  )
};

function PlanProse({ content }: { content: string }) {
  return (
    <div className="plan-prose text-[1.02rem]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={planComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function PlanModal({ actionPlan, meta }: { actionPlan: ActionPlanResponse; meta: Meta }) {
  const t = useT();
  const preparedFor = preparedForLabel(actionPlan, t);
  const nextSteps = [t("plan.next1"), t("plan.next2"), t("plan.next3")];

  return (
    <DialogContent className="flex h-[92vh] max-h-[92vh] w-[min(82rem,96vw)] max-w-none flex-col gap-0 overflow-hidden p-0">
      {/* Header reads as the masthead of a prepared document */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-900 px-7 py-8 text-white sm:px-12 sm:py-9">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-300/20 blur-3xl"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">
          <ListChecks className="h-4 w-4" />
          {t("plan.kicker")}
        </p>
        <DialogTitle className="mt-3 font-display text-[2rem] font-light leading-[1.05] tracking-[-0.01em] sm:text-[2.6rem]">
          {t("plan.modalTitle")}
        </DialogTitle>
        <DialogDescription className="mt-3 max-w-xl text-[0.97rem] leading-7 text-emerald-50/90">
          {t("plan.modalDesc")}
        </DialogDescription>
        {preparedFor && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-emerald-50/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
            {t("plan.preparedFor", { detail: preparedFor })}
          </p>
        )}
      </div>

      {/* Two-pane body: the plan reads on the left, a quick-facts rail on the right */}
      <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_22rem]">
        <div className="min-h-0 overflow-y-auto px-7 py-8 sm:px-14 sm:py-11">
          <div className="max-w-[44rem]">
            <PlanProse content={actionPlan.action_plan_text} />
          </div>
        </div>

        <aside className="hidden min-h-0 flex-col gap-6 overflow-y-auto border-l border-border bg-gradient-to-b from-mint/40 to-canvas px-7 py-9 md:flex">
          {meta.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {t("plan.atAGlance")}
              </p>
              {meta.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-emerald-100 bg-paper px-5 py-4 shadow-soft"
                >
                  <p className="font-display text-3xl font-semibold leading-none text-emerald-700">
                    {m.value}
                  </p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-haze">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {t("plan.whatNext")}
            </p>
            <ol className="mt-3 space-y-3.5">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 font-display text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[0.9rem] leading-6 text-ink/80">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-canvas/80 px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p className="flex items-start gap-2 text-xs leading-6 text-haze sm:max-w-2xl">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          {actionPlan.disclaimer}
        </p>
        <DialogClose asChild>
          <Button size="md" variant="soft" className="shrink-0">
            {t("common.close")}
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
