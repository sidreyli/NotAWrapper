import { useState } from "react";
import { Check } from "lucide-react";

// Local-only checklist toggle — nothing is persisted to an account.
export function ChecklistItem({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setChecked((c) => !c)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-paper px-4 py-3 text-left shadow-soft transition hover:border-emerald-200"
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition ${
          checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-canvas"
        }`}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <span className={`leading-6 ${checked ? "text-haze line-through" : "text-ink"}`}>{label}</span>
    </button>
  );
}
