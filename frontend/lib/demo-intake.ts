import type { UserProfile } from "./types";
import { MOCK_PROFILE } from "./mock";

// A scripted intake used only when the live AI backend is unreachable,
// so the guided experience remains fully demonstrable offline.
export const DEMO_GREETING =
  "Hi, I'm here to help you find public benefits you may qualify for. There are no wrong answers, and I'll never ask for your Social Security number or full name. To start — which state do you live in? We currently cover California, Texas, New York, Florida, and Illinois.";

const SCRIPT: string[] = [
  "Thanks. And how many people live in your household and share meals together — including yourself?",
  "Got it. How many of them are children under 18, and is anyone under 5 or pregnant?",
  "That's helpful. What's your household's total monthly income before taxes, from all sources combined? A rough number for a typical month is fine.",
  "Thank you. Are you currently working — full-time, part-time, self-employed, or not at the moment? And do you rent, own, or have another housing situation?",
  "Last thing: are you receiving any benefits right now, like SNAP, Medicaid, or others? It's okay if the answer is none.",
];

const SUMMARY =
  "Let me make sure I have everything right: a household of four in California, two children with one under five, about $2,600 a month from part-time work, renting, and not currently receiving benefits. Does that look correct? If so, I'll pull together what you may qualify for.";

export interface DemoStep {
  reply: string;
  isComplete: boolean;
  profile: UserProfile | null;
}

// step is the number of user messages already sent before this call (0-indexed)
export function demoRespond(step: number): DemoStep {
  if (step < SCRIPT.length) {
    return { reply: SCRIPT[step], isComplete: false, profile: null };
  }
  if (step === SCRIPT.length) {
    return { reply: SUMMARY, isComplete: false, profile: null };
  }
  return {
    reply:
      "Perfect — building your action plan now. One moment while I check each program.",
    isComplete: true,
    profile: MOCK_PROFILE,
  };
}
