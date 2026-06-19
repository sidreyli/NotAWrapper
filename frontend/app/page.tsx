import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ScrollText,
  Scale,
  MessageSquareText,
  ClipboardList,
  TrendingDown,
  Check,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CliffChart } from "@/components/cliff-chart";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Counter } from "@/components/ui/counter";
import { MOCK_CLIFF, MOCK_PROFILE } from "@/lib/mock";

const PROGRAMS = [
  { id: "snap", name: "SNAP", desc: "Food assistance" },
  { id: "medicaid", name: "Medicaid", desc: "Adult health coverage" },
  { id: "chip", name: "CHIP", desc: "Children's coverage" },
  { id: "liheap", name: "LIHEAP", desc: "Energy bill help" },
  { id: "wic", name: "WIC", desc: "Food for young children" },
  { id: "tanf", name: "TANF", desc: "Cash assistance" },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProgramsStrip />
      <HowItWorks />
      <CliffSection />
      <TwoModes />
      <TrustSection />
      <ClosingCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden hairline-b">
      <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(120%_90%_at_70%_0%,#000_30%,transparent_75%)]" />
      <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.02fr_1.1fr] lg:py-24">
        {/* left */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                File FY2026 · U.S. public benefits
              </span>
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-navy text-balance sm:text-6xl">
              Find every benefit
              <br />
              you qualify for.
              <br />
              <span className="text-brass">Keep the ones you have.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              Answer a few questions in plain language. Get a prioritized plan —
              what you qualify for, the documents you&apos;ll need, and exactly
              where to apply — for SNAP, Medicaid, CHIP, LIHEAP, WIC and TANF.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/intake" size="lg" className="group">
                Start guided intake
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="/navigator" size="lg" variant="outline">
                I&apos;m a caseworker
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                "No SSN or full name",
                "Rules-based, not AI guesses",
                "Every figure cited",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="h-4 w-4 text-ok" strokeWidth={2.4} />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* right — the signature chart dossier */}
        <Reveal delay={0.15}>
          <figure className="rounded-xl border border-line bg-surface p-5 shadow-lift sm:p-6">
            <figcaption className="mb-4 flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="eyebrow">The benefits cliff</p>
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-navy">
                  Net monthly resources as income rises
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-paper px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                CA · HH 4
              </span>
            </figcaption>

            <CliffChart
              points={MOCK_CLIFF.data_points}
              zones={MOCK_CLIFF.cliff_zones}
              currentIncome={MOCK_PROFILE.monthly_gross_income}
            />

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-muted">
              <Legend className="bg-navy" label="Net resources (income + benefits)" />
              <Legend dashed label="Income alone" />
              <Legend className="bg-[#b65a1c]/70" label="Cliff zone — benefits drop" />
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function Legend({
  className,
  label,
  dashed,
}: {
  className?: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {dashed ? (
        <span className="inline-block h-0.5 w-4 bg-navy-300" />
      ) : (
        <span className={`inline-block h-2 w-4 rounded-full ${className}`} />
      )}
      {label}
    </span>
  );
}

function ProgramsStrip() {
  return (
    <section className="bg-surface hairline-b">
      <div className="container-page flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <p className="eyebrow-muted shrink-0">Six programs, one map</p>
        <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-4">
          {PROGRAMS.map((p) => (
            <div key={p.id} className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-navy">
                {p.name}
              </span>
              <span className="text-xs text-faint">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MessageSquareText,
      title: "Describe your situation",
      body: "Tell us about your household in your own words, or fill a quick form. We never ask for your SSN, full name, or date of birth.",
    },
    {
      icon: Scale,
      title: "A rules engine checks each program",
      body: "Deterministic logic — not the AI — compares your details against official 2026 income limits. Every threshold is sourced and dated.",
    },
    {
      icon: ClipboardList,
      title: "Get a plan you can act on",
      body: "A prioritized checklist: what you qualify for, the documents to gather, where to apply, and how benefits change as income rises.",
    },
  ];
  return (
    <section className="container-page py-20 lg:py-28">
      <Reveal>
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl text-balance">
          From &ldquo;I don&apos;t know where to start&rdquo; to a plan in minutes.
        </h2>
      </Reveal>

      <Stagger className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
        {steps.map((s, i) => (
          <StaggerItem key={s.title} className="bg-surface">
            <div className="flex h-full flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-navy text-white">
                  <s.icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="font-mono text-sm text-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-navy">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function CliffSection() {
  return (
    <section className="bg-navy text-white">
      <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-brass-soft" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/70">
              The part most tools hide
            </span>
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-[2.6rem] sm:leading-[1.08] text-balance">
            A raise can leave you with less.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
            When income crosses a threshold, a benefit can disappear all at once —
            so earning more sometimes means having less. We chart these cliffs
            ahead of time, so a new job or extra shift never becomes a costly
            surprise.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/50">
                Programs modeled
              </dt>
              <dd className="mt-2 text-4xl font-semibold tracking-tight text-white num">
                <Counter to={6} />
              </dd>
              <p className="mt-1 text-sm text-white/60">charted together, in one view</p>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/50">
                Income range
              </dt>
              <dd className="mt-2 text-4xl font-semibold tracking-tight text-white num">
                <Counter to={5} prefix="$" suffix="k" />
              </dd>
              <p className="mt-1 text-sm text-white/60">in $50 steps, instantly</p>
            </div>
          </dl>

          <ButtonLink href="/cliff" variant="brass" className="mt-10">
            Explore the cliff
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-white/10 bg-white p-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
              <p className="text-sm font-semibold text-navy">
                Hover to see the breakdown
              </p>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
                live model
              </span>
            </div>
            <CliffChart
              points={MOCK_CLIFF.data_points}
              zones={MOCK_CLIFF.cliff_zones}
              currentIncome={MOCK_PROFILE.monthly_gross_income}
              animate={false}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TwoModes() {
  return (
    <section className="container-page py-20 lg:py-28">
      <Reveal>
        <p className="eyebrow">Two ways in</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl text-balance">
          Built for the person in need — and the person helping them.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <ModeCard
            tag="01 — Guided"
            icon={MessageSquareText}
            title="Conversational intake"
            body="A warm, plain-language chat that asks one or two questions at a time. Ideal for someone navigating benefits for the first time, in the language you choose."
            points={["Answer in your own words", "16 languages", "No jargon, no judgment"]}
            href="/intake"
            cta="Start the conversation"
            primary
          />
        </Reveal>
        <Reveal delay={0.08}>
          <ModeCard
            tag="02 — Direct"
            icon={ClipboardList}
            title="Caseworker mode"
            body="A structured form for navigators and case workers who already have the details and want an instant eligibility read across all six programs."
            points={["Every field, one screen", "Instant results", "Print-ready action plan"]}
            href="/navigator"
            cta="Open the form"
          />
        </Reveal>
      </div>
    </section>
  );
}

function ModeCard({
  tag,
  icon: Icon,
  title,
  body,
  points,
  href,
  cta,
  primary,
}: {
  tag: string;
  icon: React.ElementType;
  title: string;
  body: string;
  points: string[];
  href: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-lg border border-line bg-surface p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-navy/25 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid h-12 w-12 place-items-center rounded-md ${
            primary ? "bg-navy text-white" : "bg-paper-2 text-navy"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brass">
          {tag}
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-navy">
        {title}
      </h3>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{body}</p>
      <ul className="mt-6 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2.5 text-sm text-ink">
            <Check className="h-4 w-4 text-ok" strokeWidth={2.4} />
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-navy">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function TrustSection() {
  const items = [
    {
      icon: Scale,
      title: "The AI never decides eligibility",
      body: "A deterministic rules engine makes every determination using official income limits. The AI only helps you describe your situation and read your results.",
    },
    {
      icon: ScrollText,
      title: "Every number is sourced and dated",
      body: "Each recommendation cites its data source and effective date — USDA, CMS, HHS — so you and your caseworker can verify it.",
    },
    {
      icon: ShieldCheck,
      title: "Nothing personal is stored",
      body: "No Social Security number, full name, or exact address is ever collected. Sessions live in memory only and clear after two hours.",
    },
  ];
  return (
    <section className="bg-surface hairline-top hairline-b">
      <div className="container-page py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Why you can trust it</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl text-balance">
                Designed like an official record, not a guess.
              </h2>
              <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted">
                Benefits decisions are too important to leave to a chatbot&apos;s
                hunch. We separate the warm conversation from the cold math — on
                purpose.
              </p>
            </div>
          </Reveal>

          <Stagger className="flex flex-col">
            {items.map((it, i) => (
              <StaggerItem key={it.title}>
                <div
                  className={`flex gap-5 py-7 ${
                    i !== items.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line bg-paper text-navy">
                    <it.icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{it.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {it.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="container-page py-20 lg:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl bg-navy px-8 py-16 text-center shadow-navy sm:px-16">
          <div className="grid-paper pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(80%_120%_at_50%_0%,#000,transparent)]" />
          <div className="relative">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brass-soft">
              No account · No PII · Free
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-[2.75rem] sm:leading-[1.08] text-balance">
              See what you qualify for in the next few minutes.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
              It takes a short conversation. You walk away with a plan, the
              documents to gather, and a clear view of the road ahead.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/intake" size="lg" variant="brass">
                Start guided intake
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/navigator"
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40"
              >
                Use caseworker mode
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
