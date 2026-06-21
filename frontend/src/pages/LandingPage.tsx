import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileSearch,
  FileText,
  Lock,
  MapPinned,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Timer
} from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Motion";
import { RichText } from "@/components/RichText";
import { ProgramGlyph, PROGRAMS } from "@/lib/programs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useT, type MessageKey } from "@/i18n";

export function LandingPage({ navigate }: { navigate: (path: string) => void }) {
  const t = useT();

  const faqItems = [
    { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
    { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
    { q: t("landing.faq.q3"), a: t("landing.faq.a3") },
    { q: t("landing.faq.q4"), a: t("landing.faq.a4") },
    { q: t("landing.faq.q5"), a: t("landing.faq.a5") }
  ];

  const trustItems = [
    { icon: ShieldCheck, title: t("landing.trust.rules.title"), body: t("landing.trust.rules.body") },
    { icon: ScrollText, title: t("landing.trust.sources.title"), body: t("landing.trust.sources.body") },
    { icon: Lock, title: t("landing.trust.private.title"), body: t("landing.trust.private.body") },
    { icon: FileText, title: t("landing.trust.plain.title"), body: t("landing.trust.plain.body") },
    { icon: Sparkles, title: t("landing.trust.free.title"), body: t("landing.trust.free.body") },
    { icon: Timer, title: t("landing.trust.time.title"), body: t("landing.trust.time.body") }
  ];

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      {/* The shader is pulled up under the sticky navbar (negative margin) so the
          translucent nav floats over emerald, not the white body above it. */}
      <section className="relative isolate -mt-[5.25rem] overflow-hidden">
        <ShaderBackground />
        {/* top darken for nav legibility + bottom fade into the light body */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-[#04130D]/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-b from-transparent to-canvas" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-28 pt-[10.5rem] lg:grid-cols-[1.05fr_0.95fr] lg:pb-36 lg:pt-[12rem]">
          <div className="animate-fade-up">
            <h1 className="font-display text-[3.4rem] font-light leading-[0.98] tracking-[-0.02em] text-white text-balance sm:text-7xl">
              {t("landing.hero.titleLead")}{" "}
              <span className="relative whitespace-nowrap italic">
                {t("landing.hero.titleEmph")}
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
              {t("landing.hero.subtitle")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="gold" onClick={() => navigate("/action-center")}>
                {t("landing.hero.ctaPrimary")}
                <ArrowRight className="transition group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15"
                onClick={() => navigate("/check-eligibility")}
              >
                {t("landing.hero.ctaSecondary")}
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-emerald-50/80">
              {[t("landing.hero.badge1"), t("landing.hero.badge2"), t("landing.hero.badge3")].map((label) => (
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

          {/* Signature: the full product is visible before a user starts. */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-3xl border border-white/20 bg-white/10 backdrop-blur lg:block" />
            <div className="relative rounded-[1.75rem] border border-white/40 bg-white/90 p-5 shadow-lift backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-haze">
                    {t("landing.preview.kicker")}
                  </p>
                  <p className="font-display text-xl font-semibold text-ink">{t("landing.preview.title")}</p>
                </div>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-emerald-700">
                  {t("landing.preview.private")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: ClipboardCheck, label: t("landing.preview.tool1"), tone: "bg-emerald-100 text-emerald-700" },
                  { icon: FileSearch, label: t("landing.preview.tool2"), tone: "bg-gold-100 text-gold-600" },
                  { icon: MapPinned, label: t("landing.preview.tool3"), tone: "bg-sky/10 text-sky" },
                  { icon: CalendarDays, label: t("landing.preview.tool4"), tone: "bg-lilac/10 text-lilac" }
                ].map(({ icon: Icon, label, tone }, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate("/action-center")}
                    className="group rounded-2xl border border-border bg-paper p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lift"
                    style={{ animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.1}s both` }}
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="mt-3 block text-sm font-bold leading-5 text-ink">{label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-700 px-4 py-3 text-white">
                <span className="text-sm text-emerald-50">{t("landing.preview.footer")}</span>
                <ArrowRight className="h-4 w-4 text-gold-300" />
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
                    {id.toUpperCase()} · {t(`program.${id}.category` as MessageKey)}
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
            {t("landing.how.kicker")}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-5xl font-light leading-tight text-ink text-balance">
            <RichText text={t("landing.how.heading")} emphasisClassName="italic text-emerald-600" />
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", title: t("landing.how.step1.title"), body: t("landing.how.step1.body") },
            { n: "02", title: t("landing.how.step2.title"), body: t("landing.how.step2.body") },
            { n: "03", title: t("landing.how.step3.title"), body: t("landing.how.step3.body") }
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
                {t("landing.programs.kicker")}
              </p>
              <h2 className="mt-3 font-display text-5xl font-light text-ink">{t("landing.programs.heading")}</h2>
            </div>
            <p className="text-lg leading-8 text-haze">{t("landing.programs.subtitle")}</p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PROGRAMS).map(([id], i) => (
              <Reveal key={id} delay={(i % 3) * 0.08}>
                <div className="group h-full rounded-3xl border border-border bg-canvas p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-paper hover:shadow-lift">
                  <ProgramGlyph id={id} className="h-14 w-14" iconClassName="h-7 w-7" />
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-haze">
                    {t(`program.${id}.category` as MessageKey)}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-ink">
                    {id.toUpperCase()}
                  </h3>
                  <p className="mt-2 leading-7 text-haze">{t(`program.${id}.blurb` as MessageKey)}</p>
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
              {t("landing.trust.kicker")}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-5xl font-light leading-tight text-balance">
              <RichText text={t("landing.trust.heading")} emphasisClassName="italic text-emerald-300" />
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
        </div>
      </section>

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            {t("landing.faq.kicker")}
          </p>
          <h2 className="mt-3 font-display text-5xl font-light text-ink">{t("landing.faq.heading")}</h2>
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
              {t("landing.cta.heading")}
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-emerald-50">
              {t("landing.cta.subtitle")}
            </p>
            <Button
              size="lg"
              variant="gold"
              className="mt-8"
              onClick={() => navigate("/check-eligibility")}
            >
              {t("common.getStarted")}
              <ArrowRight className="transition group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
