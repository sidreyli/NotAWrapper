import { useEffect, useRef, useState } from "react";
import { ArrowRight, Layers, ListChecks, Loader2, Lock, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { AssistantMark } from "@/components/AssistantMark";
import { Button } from "@/components/Button";
import { ChatBubble, TypingBubble } from "@/components/ChatBubble";
import { ChatComposer } from "@/components/ChatComposer";
import { Markdown } from "@/components/Markdown";
import { CHILL, ShaderBackground } from "@/components/ShaderBackground";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramGlyph, PROGRAMS } from "@/lib/programs";
import {
  checkEligibility,
  getActionPlan,
  programChat,
  sendIntakeMessage,
  startIntake
} from "@/lib/api";
import { loadSession, saveSession, type ChatMessage, type Phase } from "@/lib/sessionStore";
import { useAppState } from "@/state/AppState";
import type { ActionPlanResponse, ChatTurn, EligibilityResult, UserProfile } from "@/types/api";

let messageId = 0;
const nextId = () => (messageId += 1);

export function CheckEligibilityPage({ navigate }: { navigate: (path: string) => void }) {
  const { language, profile, results, actionPlan, setProfile, setResults, setActionPlan } =
    useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("intake");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<"chat" | "results">("chat");
  const learnHistory = useRef<ChatTurn[]>([]);
  const started = useRef(false);
  const hydrated = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isLearn = phase === "learn";

  const pushText = (role: "user" | "assistant", content: string) =>
    setMessages((current) => [...current, { id: nextId(), role, content }]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist the conversation so it survives navigation / refresh for 2 hours.
  useEffect(() => {
    if (!hydrated.current) return;
    saveSession({ phase, sessionId, messages, learnHistory: learnHistory.current });
  }, [phase, sessionId, messages]);

  // Restore an in-progress session, or start a fresh intake conversation.
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const saved = loadSession();
    if (saved && saved.messages.length) {
      messageId = saved.messages.reduce((max, m) => Math.max(max, m.id), 0);
      setMessages(saved.messages);
      setPhase(saved.phase);
      setSessionId(saved.sessionId);
      learnHistory.current = saved.learnHistory ?? [];
      if (saved.phase === "learn") setMobileTab("results");
      setLoading(false);
      hydrated.current = true;
      return;
    }

    hydrated.current = true;
    (async () => {
      try {
        const response = await startIntake();
        setSessionId(response.session_id);
        pushText("assistant", response.reply);
      } catch {
        pushText(
          "assistant",
          "I'm having trouble starting right now. Please make sure the server is running, then refresh to try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runHandoff = async (collectedProfile: UserProfile) => {
    setPhase("checking");
    setProfile(collectedProfile);
    let checked: EligibilityResult[] = results;
    let plan: ActionPlanResponse = actionPlan;
    try {
      checked = await checkEligibility(collectedProfile);
      plan = await getActionPlan(collectedProfile, checked, language);
      setResults(checked);
      setActionPlan(plan);
      saveSession({ profile: collectedProfile, results: checked, actionPlan: plan });
      pushText(
        "assistant",
        "Your results are ready — they're on the right. I can answer questions about any of these programs: what they cover, the documents you'll need, or how to apply. What would you like to know?"
      );
    } catch {
      pushText(
        "assistant",
        "I collected your information but couldn't complete the eligibility check. Please try again shortly."
      );
    } finally {
      setPhase("learn");
      setMobileTab("results");
      setLoading(false);
    }
  };

  const handleSend = async (text: string) => {
    pushText("user", text);
    setLoading(true);
    if (isLearn) setMobileTab("chat");

    if (phase === "intake") {
      try {
        const response = await sendIntakeMessage(sessionId, text);
        setSessionId(response.session_id);
        if (response.reply) pushText("assistant", response.reply);
        if (response.is_complete && response.profile) {
          await runHandoff(response.profile);
          return;
        }
        setLoading(false);
      } catch {
        pushText("assistant", "Sorry, something went wrong. Could you say that again?");
        setLoading(false);
      }
      return;
    }

    // learn phase — grounded program Q&A
    try {
      const reply = await programChat(profile, results, language, learnHistory.current, text);
      learnHistory.current = [
        ...learnHistory.current,
        { role: "user", content: text },
        { role: "assistant", content: reply }
      ];
      pushText("assistant", reply);
    } catch {
      pushText("assistant", "Sorry, I couldn't answer that just now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = isLearn ? 100 : phase === "checking" ? 80 : Math.min(72, 16 + messages.length * 11);
  const eyebrow = isLearn
    ? "Program assistant"
    : phase === "checking"
      ? "Checking the rules"
      : "Eligibility check";

  return (
    <div className="relative isolate overflow-hidden">
      {/* A calm emerald shader breathing behind the page — mostly veiled by the
          canvas so it reads as quiet atmosphere, not a background. */}
      <ShaderBackground colors={CHILL} speed={0.16} distortion={0.6} swirl={0.4} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-canvas/78 via-canvas/95 to-canvas" />

      <div className="mx-auto flex h-[calc(100dvh-4.75rem)] w-full max-w-[94rem] flex-col px-3 pb-4 pt-2 sm:px-6">
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        {/* ── Conversation column ── */}
        <section
          className={`flex min-h-0 flex-col ${
            isLearn ? `${mobileTab === "chat" ? "flex" : "hidden"} lg:flex` : "flex"
          }`}
        >
          <header className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AssistantMark live={loading} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {eyebrow}
                </p>
                <h1 className="font-display text-xl font-semibold leading-none text-ink">
                  Your benefits guide
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isLearn && (
                <Tabs
                  value={mobileTab}
                  onValueChange={(value) => setMobileTab(value as "chat" | "results")}
                  className="lg:hidden"
                >
                  <TabsList className="h-auto rounded-full border border-border bg-paper p-1">
                    {(["chat", "results"] as const).map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-full px-4 py-1 capitalize text-haze data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
              {isLearn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate("/results")}
                >
                  Full results
                  <ArrowRight />
                </Button>
              )}
            </div>
          </header>

          <div className="relative flex-1 overflow-y-auto rounded-[1.75rem] border border-border bg-gradient-to-b from-paper to-canvas p-4 shadow-soft sm:p-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} role={message.role} content={message.content} />
              ))}
              {phase === "checking" && <CheckingCard />}
              {loading && phase !== "checking" && <TypingBubble />}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="mx-auto mt-3 w-full max-w-2xl">
            <ChatComposer
              onSend={handleSend}
              disabled={loading || phase === "checking"}
              placeholder={isLearn ? "Ask about a program…" : "Type your answer…"}
            />
            <p className="mt-2 px-2 text-center text-xs text-haze">
              Eligibility is decided by a deterministic rules engine, not by AI. General information
              only — not legal or financial advice.
            </p>
          </div>
        </section>

        {/* ── Context column: shader guide during intake, results ledger after ── */}
        <aside
          className={`min-h-0 ${
            isLearn
              ? `${mobileTab === "results" ? "block" : "hidden"} lg:block`
              : "hidden lg:block"
          }`}
        >
          {isLearn ? (
            <div className="h-full overflow-y-auto rounded-[1.75rem] border border-emerald-200/70 bg-gradient-to-b from-mint/50 to-paper p-5 shadow-soft sm:p-6">
              <ResultsLedger results={results} actionPlan={actionPlan} navigate={navigate} />
            </div>
          ) : (
            <GuidePanel progress={progress} checking={phase === "checking"} />
          )}
        </aside>
      </div>
      </div>
    </div>
  );
}

const reassurances = [
  { icon: Lock, text: "No name, SSN, or immigration status — ever." },
  { icon: ShieldCheck, text: "A deterministic engine decides eligibility, not the AI." },
  { icon: Timer, text: "Most people finish in about three minutes." }
];

function GuidePanel({ progress, checking }: { progress: number; checking: boolean }) {
  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 p-7 text-white shadow-lift sm:p-8">
      <ShaderBackground colors={CHILL} speed={0.26} distortion={0.7} swirl={0.5} />
      {/* Darker top and bottom keep the white headline and the chips legible; the
          lighter middle band lets the living emerald gradient read clearly through it. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#08160F]/55 via-[#063A29]/12 to-[#08160F]/72" />

      <div className="relative flex h-full flex-col">
        <AssistantMark size="lg" live />
        <h2 className="mt-6 font-display text-[2rem] font-light leading-[1.08] text-balance">
          {checking ? "Checking your answers against the 2026 rules." : "A few questions, then a real answer."}
        </h2>
        <p className="mt-3 max-w-sm leading-7 text-emerald-50/80">
          We ask one thing at a time, then compare your answers to published federal and state
          thresholds — no guessing, no judgment.
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
            <span>{checking ? "Running the rules" : "Collecting details"}</span>
            <span>{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="mt-2.5 h-1.5 bg-white/15 [&>div]:bg-gold-300 [&>div]:transition-transform [&>div]:duration-700 [&>div]:ease-out"
          />
        </div>

        <ul className="mt-8 space-y-3.5">
          {reassurances.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm leading-6 text-emerald-50/90">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/12 text-gold-300 ring-1 ring-white/15 backdrop-blur">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
            <Layers className="h-3.5 w-3.5" />
            Programs we check
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.keys(PROGRAMS).map((id) => (
              <span
                key={id}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur"
              >
                {id.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckingCard() {
  return (
    <div className="flex animate-msg-in gap-3">
      <AssistantMark size="sm" live />
      <Card className="flex items-center gap-3 rounded-[1.25rem] rounded-tl-md border-emerald-200 bg-mint/60 px-4 py-3 shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800">
          Checking your answers against the 2026 rules…
        </span>
      </Card>
    </div>
  );
}

function ResultsLedger({
  results,
  actionPlan,
  navigate
}: {
  results: EligibilityResult[];
  actionPlan: ActionPlanResponse;
  navigate: (path: string) => void;
}) {
  const eligible = results.filter(
    (r) => r.status === "likely_eligible" || r.status === "possibly_eligible"
  );
  const shown = eligible.length ? eligible : results;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-white shadow-soft">
          <Sparkles className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Your results
          </p>
          <p className="font-display text-xl font-semibold text-ink">
            {eligible.length} program{eligible.length === 1 ? "" : "s"} you may qualify for
          </p>
        </div>
      </div>

      <Card className="rounded-2xl p-4 shadow-soft">
        <details open className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer select-none items-center gap-2 font-display text-base font-semibold text-ink">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            Your action plan
          </summary>
          <Markdown content={actionPlan.action_plan_text} className="mt-3 text-sm" />
        </details>
      </Card>

      <div className="space-y-2.5">
        {shown.map((result) => (
          <LedgerCard key={result.program_id} result={result} navigate={navigate} />
        ))}
      </div>

      <Button className="w-full" onClick={() => navigate("/results")}>
        View full results &amp; action plan
        <ArrowRight />
      </Button>
    </div>
  );
}

function LedgerCard({
  result,
  navigate
}: {
  result: EligibilityResult;
  navigate: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => navigate(`/programs/${result.program_id}`)}
      className="block w-full rounded-2xl border border-border bg-paper p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProgramGlyph id={result.program_id} className="h-11 w-11" iconClassName="h-5 w-5" />
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight text-ink">
              {result.program_name}
            </h3>
            <div className="mt-1">
              <StatusBadge status={result.status} />
            </div>
          </div>
        </div>
        {result.estimated_monthly_benefit && (
          <div className="text-right">
            <p className="font-display text-lg font-semibold text-emerald-700">
              {result.estimated_monthly_benefit}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-haze">est.</p>
          </div>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-haze">{result.reason}</p>
    </button>
  );
}
