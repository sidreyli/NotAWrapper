import {
  ArrowRight,
  FileText,
  Lock,
  Quote,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Timer
} from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Button } from "@/components/Button";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Motion";
import { ProgramGlyph, PROGRAMS } from "@/lib/programs";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useAppState } from "@/state/AppState";
import { t } from "@/lib/i18n";

const faqItems = [
  {
    q: "Is this an official application?",
    a: "No. Aid Compass helps you understand what you may qualify for and points you to the official applications. We never submit anything for you."
  },
  {
    q: "Do I need to give my Social Security number?",
    a: "No. The guided check never asks for your name, SSN, or exact address."
  },
  {
    q: "Does the AI decide if I qualify?",
    a: "No. Eligibility comes from a deterministic rules engine using published 2026 program thresholds. The AI only explains the results in plain language."
  },
  {
    q: "Which states and programs are covered?",
    a: "This release covers SNAP, Medicaid, CHIP, LIHEAP, WIC, and TANF across CA, TX, NY, FL, and IL."
  },
  {
    q: "Is it available in Spanish?",
    a: "Yes — use the EN / ES toggle in the header to switch the interface language."
  }
];

const previewCards = [
  { id: "snap", name: "SNAP", status: "likely_eligible" as const, value: "~$394/mo" },
  { id: "medicaid", name: "Medicaid", status: "likely_eligible" as const, value: "Full coverage" },
  { id: "liheap", name: "LIHEAP", status: "possibly_eligible" as const, value: "Varies" }
];

const trustItems = [
  { icon: ShieldCheck, title: "Rules, not guesses", body: "A deterministic engine decides eligibility. The AI never changes the outcome." },
  { icon: ScrollText, title: "Sources cited", body: "Every result shows its official source, legal basis, and how current the data is." },
  { icon: Lock, title: "Private by design", body: "No name, no SSN, no immigration status. Your session clears in two hours." },
  { icon: FileText, title: "Plain language", body: "We explain every result in clear, reassuring words — in English or Spanish." },
  { icon: Sparkles, title: "Always free", body: "Aid Compass costs nothing and never sells you anything. Just guidance." },
  { icon: Timer, title: "A few minutes", body: "A guided conversation, one question at a time. Most people finish in about three." }
];

export function LandingPage({ navigate }: { navigate: (path: string) => void }) {
  const { language } = useAppState();

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      {/* The shader is pulled up under the sticky navbar (negative margin) so the
          translucent nav floats over emerald, not the white body above it. */}
      <section className="relative isolate -mt-[4.75rem] overflow-hidden">
        <ShaderBackground />
        {/* top darken for nav legibility + bottom fade into the light body */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-[#04130D]/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-b from-transparent to-canvas" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-28 pt-[10.5rem] lg:grid-cols-[1.05fr_0.95fr] lg:pb-36 lg:pt-[12rem]">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-300" />
              </span>
              Public benefits navigator
            </div>

            <h1 className="mt-7 font-display text-[3.4rem] font-light leading-[0.98] tracking-[-0.02em] text-white text-balance sm:text-7xl">
              Find the support{" "}
              <span className="relative whitespace-nowrap italic">
                you've earned
                <svg
                  className="absolute -bottom-2 left-0 w-full text-gold-300"
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 8.5C60 3 150 2.5 298 6.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-emerald-50/85">
              Have a short conversation. We check the real eligibility rules — not a guess — and show
              which programs fit, what you'd receive, and exactly what to do next.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="gold" onClick={() => navigate("/check-eligibility")}>
                See what you may qualify for
                <ArrowRight className="transition group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                {t(language, "seeHow")}
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-emerald-50/80">
              {["No SSN required", "About 3 minutes", "Sources cited"].map((label) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-gold-300 backdrop-blur">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M2.5 6.2 4.6 8.4 9.4 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Signature: floating glass results card over the shader */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-3xl border border-white/20 bg-white/10 backdrop-blur lg:block" />
            <div className="relative rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-lift backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-haze">
                    Results preview
                  </p>
                  <p className="font-display text-xl font-semibold text-ink">3 programs matched</p>
                </div>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-emerald-700">
                  Sample
                </span>
              </div>

              <div className="space-y-2.5">
                {previewCards.map((card, i) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-paper p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                    style={{ animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.12}s both` }}
                  >
                    <ProgramGlyph id={card.id} className="h-11 w-11" iconClassName="h-5 w-5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{card.name}</p>
                      <p className="truncate text-xs text-haze">{PROGRAMS[card.id]?.blurb}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={card.status} className="mb-1" />
                      <p className="text-sm font-bold text-emerald-700">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-700 px-4 py-3 text-white">
                <span className="text-sm text-emerald-50">Estimated monthly value</span>
                <span className="font-display text-2xl font-semibold text-gold-300">
                  <CountUp to={512} prefix="$" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* program marquee — seamless, starts the light body */}
        <div className="relative border-t border-border bg-paper py-4">
          <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="flex shrink-0 animate-marquee items-center gap-3 pr-3"
                aria-hidden={group === 1}
              >
                {Object.keys(PROGRAMS).map((id) => (
                  <span
                    key={`${group}-${id}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-canvas px-4 py-2 text-sm font-medium text-ink"
                  >
                    <ProgramGlyph id={id} className="h-6 w-6 rounded-lg" iconClassName="h-3.5 w-3.5" />
                    {id.toUpperCase()} · {PROGRAMS[id].category}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── How it works ───────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Simple and clear
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-5xl font-light leading-tight text-ink text-balance">
            Three steps from <span className="italic text-emerald-600">unsure</span> to a plan.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", title: "Tell us a little", body: "A short, friendly conversation — one question at a time. No name, no SSN, no jargon." },
            { n: "02", title: "We check the real rules", body: "A deterministic engine compares your answers to published 2026 federal and state thresholds." },
            { n: "03", title: "You get a clear plan", body: "See what fits, why, what you'd receive, and exactly which documents to bring." }
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-paper p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <span className="font-display text-6xl font-light text-emerald-100 transition group-hover:text-emerald-200">
                  {step.n}
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 leading-7 text-haze">{step.body}</p>
                <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-mint opacity-0 blur-2xl transition group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Programs ───────────────────────── */}
      <section id="programs" className="bg-paper py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 grid gap-6 md:grid-cols-[1fr_0.7fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                What we cover
              </p>
              <h2 className="mt-3 font-display text-5xl font-light text-ink">Programs we check</h2>
            </div>
            <p className="text-lg leading-8 text-haze">
              Six federal and state programs across California, Texas, New York, Florida, and
              Illinois.
            </p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PROGRAMS).map(([id, meta], i) => (
              <Reveal key={id} delay={(i % 3) * 0.08}>
                <div className="group h-full rounded-3xl border border-border bg-canvas p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-paper hover:shadow-lift">
                  <ProgramGlyph id={id} className="h-14 w-14" iconClassName="h-7 w-7" />
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-haze">
                    {meta.category}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-ink">
                    {id.toUpperCase()}
                  </h3>
                  <p className="mt-2 leading-7 text-haze">{meta.blurb}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Trust ───────────────────────── */}
      <section id="trust" className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="aurora" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
              Built with care
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-5xl font-light leading-tight text-balance">
              Why people <span className="italic text-emerald-300">trust</span> Aid Compass
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="bg-ink p-8 transition hover:bg-emerald-900/60">
                <item.icon className="h-7 w-7 text-emerald-300" strokeWidth={1.6} />
                <h3 className="mt-6 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-emerald-50/70">{item.body}</p>
              </div>
            ))}
          </div>

          <Reveal className="mt-14">
            <figure className="mx-auto max-w-3xl text-center">
              <Quote className="mx-auto h-9 w-9 text-gold-300" strokeWidth={1.5} />
              <blockquote className="mt-5 font-display text-2xl font-light italic leading-relaxed text-balance text-emerald-50 sm:text-3xl">
                "I didn't know I qualified for anything. In a few minutes I had a list and knew
                exactly which documents to bring."
              </blockquote>
              <figcaption className="mt-5 text-sm text-emerald-200/70">
                A parent of two — the reason we built this
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Common questions
          </p>
          <h2 className="mt-3 font-display text-5xl font-light text-ink">Good to know</h2>
        </Reveal>
        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border bg-paper px-5 shadow-soft"
              >
                <AccordionTrigger className="py-5 text-left font-display text-lg font-semibold text-ink hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[0.97rem] leading-7 text-haze">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-emerald-700 px-8 py-16 text-center text-white shadow-glow sm:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="aurora" />
          </div>
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-light leading-tight text-balance sm:text-5xl">
              See what you qualify for today.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-emerald-50">
              Free, private, and it only takes a few minutes.
            </p>
            <Button
              size="lg"
              variant="gold"
              className="mt-8"
              onClick={() => navigate("/check-eligibility")}
            >
              {t(language, "getStarted")}
              <ArrowRight className="transition group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
