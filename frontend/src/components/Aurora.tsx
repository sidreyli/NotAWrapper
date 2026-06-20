import { cn } from "@/lib/utils";

// The signature element: a slow, living gradient mesh (emerald → mint → gold → lilac)
// that drifts behind the hero. Pure CSS so it's cheap; honors prefers-reduced-motion.
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="aurora" />
      <div className="absolute inset-0 grain opacity-60" />
    </div>
  );
}
