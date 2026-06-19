"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, MapPin, Users, Wallet, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  NumberStepper,
  TextInput,
  Select,
  CheckChip,
  Toggle,
} from "@/components/ui/field";
import { LogoMark } from "@/components/site/logo";
import { Reveal } from "@/components/ui/reveal";
import { checkEligibility, getActionPlan } from "@/lib/api";
import { useApp } from "@/lib/store";
import type {
  UserProfile,
  EmploymentStatus,
  HousingStatus,
  IncomeType,
} from "@/lib/types";
import { STATE_NAMES } from "@/lib/types";

const EMPLOYMENT: { value: EmploymentStatus; label: string }[] = [
  { value: "employed_full", label: "Employed — full-time" },
  { value: "employed_part", label: "Employed — part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "not_seeking", label: "Not currently seeking" },
];

const HOUSING: { value: HousingStatus; label: string }[] = [
  { value: "rents", label: "Rents" },
  { value: "owns", label: "Owns" },
  { value: "subsidized", label: "Subsidized housing" },
  { value: "shelter", label: "Shelter" },
  { value: "unhoused", label: "Unhoused" },
  { value: "other", label: "Other" },
];

const BENEFITS = [
  { id: "snap", label: "SNAP" },
  { id: "medicaid", label: "Medicaid" },
  { id: "chip", label: "CHIP" },
  { id: "liheap", label: "LIHEAP" },
  { id: "wic", label: "WIC" },
  { id: "tanf", label: "TANF" },
  { id: "ssi", label: "SSI" },
  { id: "unemployment", label: "Unemployment" },
];

export default function NavigatorPage() {
  const router = useRouter();
  const { language, setCase } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const [state, setState] = useState("CA");
  const [zip, setZip] = useState("");
  const [household, setHousehold] = useState(3);
  const [children, setChildren] = useState(1);
  const [infants, setInfants] = useState(0);
  const [pregnant, setPregnant] = useState(0);
  const [elderly, setElderly] = useState(0);
  const [income, setIncome] = useState("1800");
  const [employment, setEmployment] = useState<EmploymentStatus>("employed_part");
  const [housing, setHousing] = useState<HousingStatus>("rents");
  const [disability, setDisability] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);

  function toggleBenefit(id: string) {
    setBenefits((b) =>
      b.includes(id) ? b.filter((x) => x !== id) : [...b, id]
    );
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const monthly = Math.max(0, Number(income) || 0);
    const incomeType: IncomeType =
      monthly === 0
        ? "no_income"
        : employment === "self_employed"
        ? "self_employment"
        : "wages";
    const profile: UserProfile = {
      session_id: "",
      state,
      household_size: household,
      adults: Math.max(1, household - children),
      children_under_18: children,
      infants_under_5: infants,
      pregnant_women: pregnant,
      elderly_members: elderly,
      has_disability: disability,
      monthly_gross_income: monthly,
      income_type: incomeType,
      employment_status: employment,
      housing_status: housing,
      current_benefits: benefits,
      citizenship_status: "prefer_not_to_say",
      language,
      zip_code: zip || null,
      profile_complete: true,
    };
    try {
      const elig = await checkEligibility(profile);
      const plan = await getActionPlan(profile, elig.results, language);
      setCase({ profile, results: elig.results, actionPlan: plan });
      router.push("/results");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <Reveal>
        <p className="eyebrow">Caseworker mode</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          Eligibility check
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted">
          Enter the household details and get an instant read across all six
          programs. Nothing here is stored — it&apos;s used only to compute this
          result.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-5">
          <FormCard n="01" icon={MapPin} title="Location">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="State" hint="Currently CA, TX, NY, FL, IL">
                <Select
                  value={state}
                  onChange={setState}
                  options={Object.entries(STATE_NAMES).map(([v, l]) => ({
                    value: v,
                    label: `${l} (${v})`,
                  }))}
                />
              </Field>
              <Field label="ZIP code" hint="Optional — for nearby offices">
                <TextInput
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="e.g. 94110"
                  inputMode="numeric"
                  maxLength={5}
                />
              </Field>
            </div>
          </FormCard>

          <FormCard n="02" icon={Users} title="Household members">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="People in household">
                <NumberStepper value={household} onChange={setHousehold} min={1} />
              </Field>
              <Field label="Children under 18">
                <NumberStepper value={children} onChange={setChildren} />
              </Field>
              <Field label="Children under 5">
                <NumberStepper value={infants} onChange={setInfants} />
              </Field>
              <Field label="Pregnant household members">
                <NumberStepper value={pregnant} onChange={setPregnant} />
              </Field>
              <Field label="Members aged 60+">
                <NumberStepper value={elderly} onChange={setElderly} />
              </Field>
            </div>
            <div className="mt-5">
              <Toggle
                checked={disability}
                onChange={setDisability}
                label="Someone in the household has a disability"
              />
            </div>
          </FormCard>

          <FormCard n="03" icon={Wallet} title="Income & situation">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Monthly gross income"
                hint="Monthly, before tax — all sources combined"
              >
                <TextInput
                  prefix="$"
                  value={income}
                  onChange={(e) =>
                    setIncome(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  inputMode="decimal"
                  placeholder="0"
                />
              </Field>
              <Field label="Employment status">
                <Select
                  value={employment}
                  onChange={(v) => setEmployment(v as EmploymentStatus)}
                  options={EMPLOYMENT}
                />
              </Field>
              <Field label="Housing situation" className="sm:col-span-2">
                <Select
                  value={housing}
                  onChange={(v) => setHousing(v as HousingStatus)}
                  options={HOUSING}
                />
              </Field>
            </div>
          </FormCard>

          <FormCard n="04" icon={HandHeart} title="Current benefits">
            <p className="-mt-1 mb-4 text-sm text-muted">
              Select any the household already receives. Leave all unchecked if
              none.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {BENEFITS.map((b) => (
                <CheckChip
                  key={b.id}
                  label={b.label}
                  checked={benefits.includes(b.id)}
                  onChange={() => toggleBenefit(b.id)}
                />
              ))}
            </div>
          </FormCard>
        </div>

        {/* summary rail */}
        <div className="lg:sticky lg:top-28">
          <div className="rounded-lg border border-line bg-surface p-6 shadow-card">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <p className="text-sm font-semibold text-navy">Case summary</p>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <SummaryRow label="State" value={STATE_NAMES[state] ?? state} />
              <SummaryRow label="Household" value={`${household} ${household === 1 ? "person" : "people"}`} />
              <SummaryRow label="Children" value={`${children} under 18`} />
              <SummaryRow
                label="Monthly income"
                value={`$${(Number(income) || 0).toLocaleString("en-US")}`}
                mono
              />
              <SummaryRow
                label="Receiving"
                value={benefits.length ? `${benefits.length} program${benefits.length > 1 ? "s" : ""}` : "None"}
              />
            </dl>

            <Button
              onClick={submit}
              disabled={submitting}
              size="lg"
              className="mt-6 w-full"
            >
              {submitting ? "Checking…" : "Check eligibility"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
            <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-faint">
              Eligibility is computed by a deterministic rules engine, then
              explained in plain language.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>{submitting && <Processing />}</AnimatePresence>
    </div>
  );
}

function FormCard({
  n,
  icon: Icon,
  title,
  children,
}: {
  n: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="rounded-lg border border-line bg-surface p-6 shadow-xs sm:p-7">
        <header className="mb-5 flex items-center gap-3 border-b border-line pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-paper-2 text-navy">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          <span className="ml-auto font-mono text-xs text-brass">{n}</span>
        </header>
        {children}
      </section>
    </Reveal>
  );
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-3 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-medium text-navy ${mono ? "num" : ""}`}>{value}</dd>
    </div>
  );
}

function Processing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-paper/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-2 border-line border-t-navy"
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Checking eligibility
        </p>
      </div>
    </motion.div>
  );
}
