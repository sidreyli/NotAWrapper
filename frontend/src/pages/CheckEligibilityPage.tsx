import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import { AssistantMark } from "../components/AssistantMark";
import { ChatBubble, TypingBubble } from "../components/ChatBubble";
import { ChatComposer } from "../components/ChatComposer";
import { LineIcon } from "../components/LineIcon";
import { Markdown } from "../components/Markdown";
import { StatusPill } from "../components/StatusPill";
import {
  checkEligibility,
  getActionPlan,
  programChat,
  sendIntakeMessage,
  startIntake
} from "../lib/api";
import { loadSession, saveSession, type ChatMessage, type Phase } from "../lib/sessionStore";
import { useAppState } from "../state/AppState";
import type { ActionPlanResponse, ChatTurn, EligibilityResult, UserProfile } from "../types/api";

const programIcons: Record<string, Parameters<typeof LineIcon>[0]["name"]> = {
  snap: "bag",
  medicaid: "health",
  wic: "health",
  liheap: "bill",
  tanf: "bill",
  chip: "people"
};

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
  // (Results, profile, and action plan are persisted at handoff and merged in.)
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

    // learn phase — grounded program Q&A (profile/results come from app state)
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

  const tabClass = (tab: "chat" | "results") =>
    `rounded-lg px-4 py-1.5 text-sm font-bold transition ${
      mobileTab === tab ? "bg-teal text-white shadow-card" : "text-muted"
    }`;

  return (
    <section className="mx-auto flex h-[calc(100vh-72px)] w-full max-w-7xl flex-col px-4 py-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AssistantMark live />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-teal">
              {isLearn ? "Program assistant" : "Eligibility check"}
            </p>
            <h1 className="font-display text-2xl font-black leading-none text-dark">
              Benefits assistant
            </h1>
          </div>
        </div>
        {isLearn && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-surface p-1 lg:hidden">
              <button type="button" className={tabClass("chat")} onClick={() => setMobileTab("chat")}>
                Chat
              </button>
              <button
                type="button"
                className={tabClass("results")}
                onClick={() => setMobileTab("results")}
              >
                Results
              </button>
            </div>
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={() => navigate("/results")}
            >
              Full results
            </Button>
          </div>
        )}
      </header>

      <div
        className={
          isLearn
            ? "grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
            : "min-h-0 flex-1"
        }
      >
        {/* Conversation pane */}
        <div
          className={`flex min-h-0 flex-col ${
            isLearn
              ? `${mobileTab === "chat" ? "flex" : "hidden"} lg:flex`
              : "mx-auto w-full max-w-2xl"
          }`}
        >
          <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-page p-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} content={message.content} />
            ))}
            {loading && <TypingBubble />}
            <div ref={bottomRef} />
          </div>
          <div className="mt-3">
            <ChatComposer
              onSend={handleSend}
              disabled={loading || phase === "checking"}
              placeholder={isLearn ? "Ask about a program..." : "Type your answer..."}
            />
          </div>
        </div>

        {/* Results ledger */}
        {isLearn && (
          <aside
            className={`min-h-0 overflow-y-auto rounded-2xl border border-teal/25 bg-gradient-to-b from-softAqua/50 to-surface p-4 ${
              mobileTab === "results" ? "block" : "hidden"
            } lg:block`}
          >
            <ResultsLedger results={results} actionPlan={actionPlan} navigate={navigate} />
          </aside>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        Eligibility is decided by a deterministic rules engine, not by AI. This is general
        information only, not legal or financial advice.
      </p>
    </section>
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
    (result) => result.status === "likely_eligible" || result.status === "possibly_eligible"
  );
  const shown = eligible.length ? eligible : results;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-teal">
          Your results
        </p>
        <p className="font-display text-2xl font-black text-dark">
          {eligible.length} program{eligible.length === 1 ? "" : "s"} you may qualify for
        </p>
      </div>

      <details open className="rounded-2xl border border-border bg-surface p-4">
        <summary className="cursor-pointer select-none font-display text-lg font-black text-dark">
          Your action plan
        </summary>
        <Markdown
          content={actionPlan.action_plan_text}
          className="mt-3 text-[15px] leading-7 text-slate-700"
        />
      </details>

      <div className="space-y-3">
        {shown.map((result) => (
          <LedgerCard key={result.program_id} result={result} navigate={navigate} />
        ))}
      </div>

      <Button className="w-full" onClick={() => navigate("/results")}>
        View full results & action plan {"->"}
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
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-card transition hover:border-teal/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-softAqua text-lineInk">
            <LineIcon name={programIcons[result.program_id] ?? "doc"} />
          </span>
          <div>
            <h3 className="font-display text-xl font-black leading-tight text-dark">
              {result.program_name}
            </h3>
            <div className="mt-1">
              <StatusPill status={result.status} />
            </div>
          </div>
        </div>
        {result.estimated_monthly_benefit && (
          <div className="text-right">
            <p className="font-display text-xl font-black text-success">
              {result.estimated_monthly_benefit}
            </p>
            <p className="text-[11px] font-bold text-slate-400">est./mo</p>
          </div>
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{result.reason}</p>
      <button
        type="button"
        onClick={() => navigate(`/programs/${result.program_id}`)}
        className="mt-3 text-sm font-extrabold text-teal hover:text-deep"
      >
        View details {"->"}
      </button>
    </article>
  );
}
