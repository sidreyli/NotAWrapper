import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { IntakeQuestion, type IntakeOption } from "../components/IntakeQuestion";
import { checkEligibility, getActionPlan } from "../lib/api";
import { useAppState } from "../state/AppState";
import type { UserProfile } from "../types/api";

interface IntakeAnswers {
  state: string;
  household: string;
  children: string;
  youngChild: string;
  income: string;
  benefits: string[];
}

const defaultAnswers: IntakeAnswers = {
  state: "CA",
  household: "3",
  children: "2",
  youngChild: "under5",
  income: "1500",
  benefits: ["none"]
};

const stateOptions: IntakeOption[] = [
  { label: "California", value: "CA" },
  { label: "Texas", value: "TX" },
  { label: "New York", value: "NY" },
  { label: "Florida", value: "FL" },
  { label: "Illinois", value: "IL" }
];

const questions: Array<{
  key: keyof IntakeAnswers;
  eyebrow: string;
  title: string;
  description: string;
  options: IntakeOption[];
  multi?: boolean;
}> = [
  {
    key: "state",
    eyebrow: "Where you live",
    title: "Which state do you live in?",
    description: "We currently support five states while we expand to the rest of the country.",
    options: stateOptions
  },
  {
    key: "household",
    eyebrow: "Your household",
    title: "How many people live in your home?",
    description: "Count everyone you buy and prepare food with, including yourself and any children.",
    options: [
      { label: "Just me", value: "1" },
      { label: "2 people", value: "2" },
      { label: "3 people", value: "3" },
      { label: "4 people", value: "4" },
      { label: "5 or more", value: "5" }
    ]
  },
  {
    key: "children",
    eyebrow: "Your household",
    title: "Are there children under 18 at home?",
    description: "This helps us check programs like CHIP, WIC, and cash assistance.",
    options: [
      { label: "No children", value: "0" },
      { label: "Yes - one child", value: "1" },
      { label: "Yes - two children", value: "2" },
      { label: "Yes - three or more", value: "3" }
    ]
  },
  {
    key: "youngChild",
    eyebrow: "Your household",
    title: "Is anyone pregnant, or is there a child under 5?",
    description: "Some nutrition programs are designed specifically for pregnancy and early childhood.",
    options: [
      { label: "No", value: "none" },
      { label: "Yes - a child under 5", value: "under5" },
      { label: "Yes - someone is pregnant", value: "pregnant" },
      { label: "Both", value: "both" }
    ]
  },
  {
    key: "income",
    eyebrow: "Household income",
    title: "About how much does your household earn before taxes each month?",
    description: "A rough range is fine. We use this only to compare against program limits.",
    options: [
      { label: "Under $1,000", value: "750" },
      { label: "$1,000 - $1,999", value: "1500", note: "Most common range" },
      { label: "$2,000 - $2,999", value: "2500" },
      { label: "$3,000 - $3,999", value: "3500" },
      { label: "$4,000 or more", value: "4500" }
    ]
  },
  {
    key: "benefits",
    eyebrow: "Current benefits",
    title: "Do you already receive any of these?",
    description: "Select any that apply, or None yet. You can pick more than one.",
    multi: true,
    options: [
      { label: "None yet", value: "none" },
      { label: "SNAP", value: "snap" },
      { label: "Medicaid", value: "medicaid" },
      { label: "WIC", value: "wic" },
      { label: "Cash assistance (TANF)", value: "tanf" }
    ]
  }
];

function answersToProfile(answers: IntakeAnswers, language: UserProfile["language"]): UserProfile {
  const household = Number(answers.household);
  const children = Math.min(Number(answers.children), Math.max(0, household - 1));
  const pregnant = answers.youngChild === "pregnant" || answers.youngChild === "both" ? 1 : 0;
  const under5 = answers.youngChild === "under5" || answers.youngChild === "both" ? Math.max(1, Math.min(children, 2)) : 0;

  return {
    session_id: "",
    state: answers.state,
    household_size: household,
    adults: Math.max(1, household - children),
    children_under_18: children,
    infants_under_5: under5,
    pregnant_women: pregnant,
    elderly_members: 0,
    has_disability: false,
    monthly_gross_income: Number(answers.income),
    income_type: "wages",
    employment_status: "employed_part",
    housing_status: "rents",
    current_benefits: answers.benefits.includes("none") ? [] : answers.benefits,
    citizenship_status: "prefer_not_to_say",
    language,
    zip_code: null,
    profile_complete: true,
    collected_at: new Date().toISOString()
  };
}

export function CheckEligibilityPage({ navigate }: { navigate: (path: string) => void }) {
  const { language, setProfile, setResults, setActionPlan } = useAppState();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(defaultAnswers);
  const [loading, setLoading] = useState(false);
  const profile = useMemo(() => answersToProfile(answers, language), [answers, language]);
  const question = questions[step];

  const submit = async () => {
    setLoading(true);
    setProfile(profile);
    const results = await checkEligibility(profile);
    const plan = await getActionPlan(profile, results, language);
    setResults(results);
    setActionPlan(plan);
    setLoading(false);
    navigate("/results");
  };

  if (step >= questions.length) {
    const rows = [
      ["State", stateOptions.find((item) => item.value === answers.state)?.label ?? answers.state],
      ["Household size", `${profile.household_size} people`],
      ["Children under 18", String(profile.children_under_18)],
      ["Pregnancy / young child", answers.youngChild === "none" ? "No" : answers.youngChild],
      ["Monthly income", `$${profile.monthly_gross_income.toLocaleString()}/mo`],
      ["Current benefits", profile.current_benefits.length ? profile.current_benefits.join(", ") : "None yet"]
    ];

    return (
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-12 flex items-center gap-4">
          <button className="text-lg font-semibold text-slate-700" onClick={() => setStep(step - 1)} type="button">
            {'<-'} Back
          </button>
          <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-teal to-aqua" />
          <span className="font-bold text-muted">Review</span>
        </div>
        <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.22em] text-teal">Last step</p>
        <h1 className="display-heading mb-5 text-5xl text-dark">Here's what you told us</h1>
        <p className="mb-8 text-xl leading-8 text-muted">Take a quick look. You can go back and change anything.</p>
        <Card>
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-border px-6 py-5 last:border-b-0">
              <span className="text-lg text-muted">{label}</span>
              <span className="text-right text-lg font-extrabold">{value}</span>
            </div>
          ))}
        </Card>
        <Button className="mt-8 w-full" onClick={submit} disabled={loading}>
          {loading ? "Checking..." : "Check my eligibility"}
        </Button>
      </section>
    );
  }

  return (
    <IntakeQuestion
      eyebrow={question.eyebrow}
      title={question.title}
      description={question.description}
      options={question.options}
      value={answers[question.key]}
      multi={question.multi}
      onChange={(value) => setAnswers((current) => ({ ...current, [question.key]: value }))}
      onBack={() => (step === 0 ? navigate("/") : setStep(step - 1))}
      onNext={() => setStep(step + 1)}
      step={step + 1}
      total={questions.length}
    />
  );
}
