"use client";

import { Minus, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-navy">{label}</span>
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="inline-flex h-11 w-full items-center justify-between rounded-md border border-line bg-surface px-1.5 shadow-xs">
      <button
        type="button"
        onClick={() => set(value - 1)}
        aria-label="Decrease"
        disabled={value <= min}
        className="grid h-8 w-8 place-items-center rounded-sm text-navy transition-colors hover:bg-paper-2 disabled:opacity-25"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="num text-base font-semibold text-navy tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        aria-label="Increase"
        disabled={value >= max}
        className="grid h-8 w-8 place-items-center rounded-sm text-navy transition-colors hover:bg-paper-2 disabled:opacity-25"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function TextInput({
  prefix,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  return (
    <div className="flex h-11 items-center rounded-md border border-line bg-surface px-3 shadow-xs focus-within:border-navy/40">
      {prefix && <span className="mr-1.5 text-muted">{prefix}</span>}
      <input
        className={cn(
          "h-full w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-faint",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-md border border-line bg-surface px-3 pr-9 text-[0.95rem] text-ink shadow-xs outline-none focus:border-navy/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

export function CheckChip({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all",
        checked
          ? "border-navy bg-navy text-white shadow-xs"
          : "border-line bg-surface text-muted hover:border-navy/30 hover:text-navy"
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 place-items-center rounded-[5px] border",
          checked ? "border-white/40 bg-white/15" : "border-line-strong"
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-3.5 py-3 text-left shadow-xs transition-colors hover:border-navy/30"
    >
      <span className="text-sm font-medium text-navy">{label}</span>
      <span
        className={cn(
          "relative h-6 w-10 rounded-full transition-colors",
          checked ? "bg-navy" : "bg-line-strong"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[1.125rem]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}
