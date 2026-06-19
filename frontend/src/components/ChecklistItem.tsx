import { useState } from "react";

export function ChecklistItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 text-lg font-semibold">
      <input className="mt-1 h-5 w-5 accent-teal" type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
      <span className={checked ? "text-muted line-through" : "text-ink"}>{label}</span>
    </label>
  );
}
