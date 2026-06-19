import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FAQAccordion } from "../components/FAQAccordion";
import { LandingSection } from "../components/LandingSection";
import { LineIcon } from "../components/LineIcon";
import { ProgramCategoryCard } from "../components/ProgramCategoryCard";
import { useAppState } from "../state/AppState";
import { t } from "../lib/i18n";

export function LandingPage({ navigate }: { navigate: (path: string) => void }) {
  const { language } = useAppState();

  const faqItems = [
    {
      question: "Is this an official application?",
      answer: "No. NotAWrapper helps you understand what you may qualify for and points you to official applications. We never submit anything for you."
    },
    {
      question: "Do I need to give my Social Security number?",
      answer: "No. The guided check never asks for your name, SSN, or exact address."
    },
    {
      question: "Does the AI decide if I qualify?",
      answer: "No. Eligibility comes from deterministic rules using published program thresholds. AI only helps explain the results in plain language."
    },
    {
      question: "Which states and programs are covered?",
      answer: "This demo covers SNAP, Medicaid, CHIP, LIHEAP, WIC, and TANF in CA, TX, NY, FL, and IL."
    },
    {
      question: "Is it available in Spanish?",
      answer: "Yes. Use the EN / ES toggle to switch the visible interface language."
    }
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-softAqua py-20">
        <div className="absolute left-10 top-28 hidden h-44 w-44 items-center justify-center rounded-3xl border border-cyan-100 bg-white/60 text-lineInk md:flex">
          <LineIcon name="home" className="h-24 w-24" />
        </div>
        <div className="absolute bottom-20 left-24 hidden h-36 w-36 items-center justify-center rounded-3xl border border-cyan-100 bg-white/60 text-lineInk lg:flex">
          <LineIcon name="bag" className="h-20 w-20" />
        </div>
        <div className="absolute right-14 top-28 hidden h-40 w-40 items-center justify-center rounded-3xl border border-cyan-100 bg-white/60 text-lineInk md:flex">
          <LineIcon name="doc" className="h-20 w-20" />
        </div>
        <div className="mx-auto max-w-5xl px-5 text-center">
          <div className="mx-auto mb-9 inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-5 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-teal">
            <span className="h-2 w-2 rounded-full bg-aqua" />
            Public benefits navigator
          </div>
          <h1 className="display-heading mx-auto max-w-4xl text-6xl text-dark md:text-8xl">
            Find the support <span className="text-teal">you've earned</span>
          </h1>
          <p className="mx-auto mt-8 max-w-4xl text-2xl leading-10 text-muted">
            Answer a few simple questions. We check the real eligibility rules, not a guess, and show which programs fit, what you'd get, and exactly what to do next.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button className="text-lg" onClick={() => navigate("/check-eligibility")}>
              See what you may qualify for
            </Button>
            <Button variant="secondary" className="text-lg" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              {t(language, "seeHow")}
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-lg font-semibold text-muted">
            <span className="text-success">v <span className="text-muted">No SSN required</span></span>
            <span className="text-success">v <span className="text-muted">About 3 minutes</span></span>
            <span className="text-success">v <span className="text-muted">Sources cited</span></span>
          </div>
          <Card className="mx-auto mt-16 max-w-3xl p-6 text-left shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-extrabold uppercase tracking-[0.14em] text-slate-500">Results preview</p>
              <p className="font-bold text-teal">Sample</p>
            </div>
            {[
              ["snap", "SNAP", "Monthly grocery money on a card for low-income households.", "Likely eligible"],
              ["health", "Medicaid", "Free or low-cost comprehensive health coverage for adults.", "Likely eligible"],
              ["bill", "LIHEAP", "Help paying home heating and cooling bills.", "Worth a look"]
            ].map(([icon, name, description, status]) => (
              <div key={name} className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 last:mb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-softAqua text-lineInk">
                    <LineIcon name={icon as Parameters<typeof LineIcon>[0]["name"]} className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold">{name}</p>
                    <p className="text-muted">{description}</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-green-50 px-4 py-2 text-sm font-extrabold text-success sm:inline-flex">{status}</span>
              </div>
            ))}
          </Card>
        </div>
      </section>

      <LandingSection id="how-it-works" eyebrow="Simple and clear" title="How it works">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["doc", "Tell us a little", "A few simple questions, one at a time. No name, no Social Security number, no jargon."],
            ["shield", "We check the real rules", "A deterministic rules engine compares your answers to published 2026 federal and state thresholds."],
            ["bill", "You get a clear plan", "See what fits, why, what you'd receive, and exactly which documents to bring."]
          ].map(([icon, title, body], index) => (
            <Card key={title} className="relative min-h-72 p-8">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-softAqua text-teal">
                <LineIcon name={icon as Parameters<typeof LineIcon>[0]["name"]} />
              </div>
              <p className="absolute right-8 top-7 text-5xl font-black text-softAqua">{index + 1}</p>
              <h3 className="font-display text-3xl font-black text-dark">{title}</h3>
              <p className="mt-5 text-lg leading-8 text-slate-700">{body}</p>
            </Card>
          ))}
        </div>
      </LandingSection>

      <section id="programs" className="bg-page py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
            <div>
              <p className="mb-6 text-sm font-extrabold uppercase tracking-[0.22em] text-teal">What we cover</p>
              <h2 className="display-heading text-6xl text-dark">Programs we check</h2>
            </div>
            <p className="text-xl leading-8 text-slate-700">Six federal and state programs across CA, TX, NY, FL, and IL.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ProgramCategoryCard icon="bag" name="SNAP" category="Food assistance" description="Monthly grocery money on a card for low-income households." />
            <ProgramCategoryCard icon="health" name="Medicaid" category="Health coverage" description="Free or low-cost comprehensive health coverage for adults." tint="bg-cyan-50" />
            <ProgramCategoryCard icon="health" name="WIC" category="Nutrition" description="Food and nutrition support for pregnancy and young children." />
            <ProgramCategoryCard icon="bill" name="LIHEAP" category="Utilities" description="Help paying home heating and cooling bills." tint="bg-amber-50" />
            <ProgramCategoryCard icon="people" name="CHIP" category="Health coverage" description="Low-cost coverage for children above the Medicaid limit." tint="bg-slate-100" />
            <ProgramCategoryCard icon="bill" name="TANF" category="Cash assistance" description="Short-term cash help for families with children." tint="bg-violet-50" />
          </div>
        </div>
      </section>

      <LandingSection id="built-care" eyebrow="Built with care" title="Why people trust NotAWrapper" dark>
        <div className="grid gap-px md:grid-cols-3">
          {[
            ["shield", "Rules, not guesses", "A deterministic engine decides eligibility. The AI never changes the outcome."],
            ["doc", "Sources cited", "Every result shows its official source, legal basis, and how current the data is."],
            ["lock", "Private by design", "No name, no SSN, no immigration status. Your session is deleted in 2 hours."],
            ["doc", "Plain language", "We explain every result in clear, reassuring words in English or Spanish."],
            ["tag", "Always free", "NotAWrapper costs nothing and never sells you anything. Just guidance."],
            ["clock", "A few minutes", "A guided interview, one question at a time. Most people finish in about 3 minutes."]
          ].map(([icon, title, body]) => (
            <div key={title} className="border-t border-white/15 p-6">
              <LineIcon name={icon as Parameters<typeof LineIcon>[0]["name"]} className="mb-8 text-aqua" />
              <h3 className="font-display text-2xl font-black">{title}</h3>
              <p className="mt-4 text-lg leading-8 text-cyan-50/80">{body}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection id="faq" eyebrow="Common questions" title="Frequently asked">
        <FAQAccordion items={faqItems} />
      </LandingSection>

      <section className="bg-page pb-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col gap-8 rounded-3xl bg-teal p-10 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display-heading text-5xl">See what you qualify for today</h2>
              <p className="mt-5 text-xl text-cyan-50">Free, private, and it only takes a few minutes.</p>
            </div>
            <Button variant="aqua" className="text-lg" onClick={() => navigate("/check-eligibility")}>
              {t(language, "getStarted")}
            </Button>
          </div>
          <footer className="mt-12 flex flex-col gap-5 border-t border-border pt-8 text-muted md:flex-row">
            <p className="font-display text-2xl font-black text-dark">NotAWrapper</p>
            <p>
              NotAWrapper provides general guidance only. Final eligibility is determined by the agency you apply to. This is not legal or financial advice.
            </p>
          </footer>
        </div>
      </section>
    </>
  );
}
