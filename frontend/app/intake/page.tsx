"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import {
  startIntake,
  sendIntakeMessage,
  checkEligibility,
  getActionPlan,
} from "@/lib/api";
import { demoRespond, DEMO_GREETING } from "@/lib/demo-intake";
import { useApp } from "@/lib/store";
import type { UserProfile } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const COLLECTING = [
  "State & household size",
  "Children, ages & pregnancy",
  "Monthly income",
  "Work & housing situation",
  "Current benefits",
];

export default function IntakePage() {
  const router = useRouter();
  const { language, setCase } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [building, setBuilding] = useState(false);
  const [demo, setDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const sessionId = useRef<string | null>(null);
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  // open the session
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      setThinking(true);
      try {
        const res = await startIntake();
        sessionId.current = res.session_id;
        setMessages([{ role: "assistant", content: res.reply }]);
      } catch {
        setDemo(true);
        setMessages([{ role: "assistant", content: DEMO_GREETING }]);
      } finally {
        setThinking(false);
        scrollToEnd();
      }
    })();
  }, [scrollToEnd]);

  const finalize = useCallback(
    async (profile: UserProfile) => {
      setBuilding(true);
      try {
        const elig = await checkEligibility(profile);
        const plan = await getActionPlan(profile, elig.results, language);
        setCase({ profile, results: elig.results, actionPlan: plan });
        router.push("/results");
      } catch {
        setBuilding(false);
      }
    },
    [language, router, setCase]
  );

  async function handleSend() {
    const text = input.trim();
    if (!text || thinking || building) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setThinking(true);
    scrollToEnd();

    await new Promise((r) => setTimeout(r, demo ? 650 : 0));

    try {
      if (demo) {
        const step = demoStep;
        setDemoStep((s) => s + 1);
        const res = demoRespond(step);
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
        setThinking(false);
        scrollToEnd();
        if (res.isComplete && res.profile) {
          await new Promise((r) => setTimeout(r, 500));
          finalize(res.profile);
        }
        return;
      }

      const res = await sendIntakeMessage(sessionId.current, text);
      sessionId.current = res.session_id;
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      setThinking(false);
      scrollToEnd();
      if (res.is_complete && res.profile) {
        finalize(res.profile);
      }
    } catch {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — I had trouble connecting just now. Please try sending that again.",
        },
      ]);
      scrollToEnd();
    }
  }

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_280px]">
        {/* chat */}
        <div className="flex h-[calc(100vh-12rem)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-3">
              <LogoMark className="h-9 w-9" />
              <div>
                <p className="text-sm font-semibold text-navy">
                  Benefits intake
                </p>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
                  {demo ? "Demo conversation" : "Live · secure"}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[0.7rem] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-ok" />
              No PII collected
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {thinking && <Typing />}
          </div>

          <div className="border-t border-line bg-surface-2 p-3">
            <div className="flex items-end gap-2 rounded-lg border border-line bg-surface p-2 shadow-xs focus-within:border-navy/40">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                disabled={building}
                placeholder="Type your answer…"
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.95rem] text-ink outline-none placeholder:text-faint"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking || building}
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-navy text-white transition-all hover:bg-navy-700 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
            <p className="mt-2 px-1 text-center text-[0.7rem] text-faint">
              Press Enter to send · This is general information, not a final
              determination.
            </p>
          </div>
        </div>

        {/* rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-lg border border-line bg-surface p-5 shadow-xs">
            <p className="eyebrow">What we&apos;ll cover</p>
            <ul className="mt-4 space-y-3">
              {COLLECTING.map((c, i) => (
                <li key={c} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line font-mono text-[0.6rem] text-muted">
                    {i + 1}
                  </span>
                  <span className="text-muted">{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs leading-relaxed text-faint">
                Answer in your own words — there&apos;s no form to fill. The
                assistant only gathers details; a separate rules engine decides
                eligibility.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>{building && <BuildingOverlay />}</AnimatePresence>
    </div>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {isUser ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper-2 text-xs font-semibold text-navy">
          You
        </span>
      ) : (
        <LogoMark className="h-8 w-8 shrink-0" />
      )}
      <div
        className={`max-w-[82%] rounded-lg px-4 py-3 text-[0.95rem] leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-navy text-white"
            : "rounded-tl-sm border border-line bg-paper text-ink"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <div className="flex gap-3">
      <LogoMark className="h-8 w-8 shrink-0" />
      <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm border border-line bg-paper px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-navy-300"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function BuildingOverlay() {
  const steps = [
    "Reading your household details",
    "Checking each program's 2026 rules",
    "Modeling the benefits cliff",
    "Writing your action plan",
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-paper/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        className="w-[min(92vw,420px)] rounded-xl border border-line bg-surface p-8 shadow-lift"
      >
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="font-semibold text-navy">Building your plan</p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
              A few seconds
            </p>
          </div>
        </div>
        <ul className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <motion.li
              key={s}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.6 }}
              className="flex items-center gap-3 text-sm text-muted"
            >
              <motion.span
                className="grid h-5 w-5 place-items-center rounded-full bg-ok-wash"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.6 + 0.2 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              </motion.span>
              {s}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
