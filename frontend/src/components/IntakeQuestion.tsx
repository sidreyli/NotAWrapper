import { Button } from "./Button";

export interface IntakeOption {
  label: string;
  value: string;
  note?: string;
}

export function IntakeQuestion({
  eyebrow,
  title,
  description,
  options,
  value,
  multi = false,
  onChange,
  onBack,
  onNext,
  step,
  total
}: {
  eyebrow: string;
  title: string;
  description: string;
  options: IntakeOption[];
  value: string | string[];
  multi?: boolean;
  onChange: (value: string | string[]) => void;
  onBack: () => void;
  onNext: () => void;
  step: number;
  total: number;
}) {
  const isSelected = (option: string) => (Array.isArray(value) ? value.includes(option) : value === option);

  const select = (option: string) => {
    if (!multi) {
      onChange(option);
      return;
    }
    const current = Array.isArray(value) ? value : [];
    if (option === "none") {
      onChange(["none"]);
      return;
    }
    const withoutNone = current.filter((item) => item !== "none");
    onChange(withoutNone.includes(option) ? withoutNone.filter((item) => item !== option) : [...withoutNone, option]);
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-12 flex items-center gap-4">
        <button className="text-lg font-semibold text-slate-700" onClick={onBack} type="button">
          {'<-'} Back
        </button>
        <div className="h-2 flex-1 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-gradient-to-r from-teal to-aqua" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <span className="font-bold text-muted">Question {step} of {total}</span>
      </div>
      <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.22em] text-teal">{eyebrow}</p>
      <h1 className="display-heading mb-5 text-5xl text-dark">{title}</h1>
      <p className="mb-8 text-xl leading-8 text-muted">{description}</p>
      <div className="space-y-4">
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <button
              key={option.value}
              className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                selected ? "border-teal bg-softAqua" : "border-border bg-surface hover:border-teal"
              }`}
              onClick={() => select(option.value)}
              type="button"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  selected ? "border-teal bg-teal text-white" : "border-slate-300 bg-white"
                }`}
              >
                {selected ? "v" : ""}
              </span>
              <span>
                <span className="block text-xl font-extrabold">{option.label}</span>
                {option.note && <span className="block text-base text-muted">{option.note}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-8 text-muted">Your answers stay private. We never ask for your name or Social Security number.</p>
      <Button className="mt-8 w-full" onClick={onNext} disabled={Array.isArray(value) ? value.length === 0 : !value}>
        Continue
      </Button>
    </section>
  );
}
