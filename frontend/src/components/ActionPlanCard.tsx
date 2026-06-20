import { ListChecks, Maximize2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { Markdown } from "./Markdown";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import type { ActionPlanResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type Meta = Array<{ label: string; value: string }>;

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
                Your action plan
              </p>
              <h2 className="font-display text-xl font-semibold text-ink">Your benefits plan</h2>
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
              Open full plan
            </Button>
          </DialogTrigger>
          <PlanModal actionPlan={actionPlan} meta={meta} />
        </Dialog>
      </div>
    </article>
  );
}

function PlanModal({ actionPlan, meta }: { actionPlan: ActionPlanResponse; meta: Meta }) {
  return (
    <DialogContent className="flex h-[92vh] max-h-[92vh] w-[min(80rem,96vw)] max-w-none flex-col gap-0 overflow-hidden p-0">
      {/* Emerald header band keeps the title legible and ties the modal to the brand */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-900 px-7 py-7 text-white sm:px-10 sm:py-9">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold-300/20 blur-3xl"
          aria-hidden
        />
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">
          <ListChecks className="h-4 w-4" />
          Your action plan
        </p>
        <DialogTitle className="mt-3 font-display text-3xl font-light leading-tight tracking-[-0.01em] sm:text-[2.5rem]">
          Your plain-language plan
        </DialogTitle>
        <DialogDescription className="mt-2.5 max-w-xl text-[0.97rem] leading-7 text-emerald-50/90">
          Everything we found, in clear words — what fits, why, and exactly what to do next.
        </DialogDescription>
      </div>

      {/* Two-pane body: the plan reads on the left, a quick-facts rail on the right */}
      <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_23rem]">
        <div className="min-h-0 overflow-y-auto px-7 py-7 sm:px-12 sm:py-10">
          <div className="mx-auto max-w-3xl">
            <Markdown content={actionPlan.action_plan_text} className="text-[1.05rem] leading-8" />
          </div>
        </div>

        <aside className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-l border-border bg-canvas/60 px-7 py-10 md:flex">
          {meta.length > 0 && (
            <div className="space-y-3">
              {meta.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-emerald-100 bg-paper px-5 py-4 shadow-soft"
                >
                  <p className="font-display text-2xl font-semibold leading-none text-emerald-700">
                    {m.value}
                  </p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-haze">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-gold-100 bg-gold-50/70 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#7a4e0c]">
              <Sparkles className="h-4 w-4" />
              What happens next
            </p>
            <p className="mt-2 text-[0.85rem] leading-6 text-[#7a4e0c]/85">
              Gather the listed documents, then apply through the official links. Each agency makes
              the final decision.
            </p>
          </div>
        </aside>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-canvas/80 px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="flex items-start gap-2 text-xs leading-6 text-haze sm:max-w-xl">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          {actionPlan.disclaimer}
        </p>
        <DialogClose asChild>
          <Button size="md" variant="soft" className="shrink-0">
            Close
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
