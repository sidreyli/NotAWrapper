import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

// The assistant's identity mark — a refined emerald squircle carrying the Aid
// Compass glyph, echoing the logo tile. When `live`, a soft ring breathes around
// it to signal the assistant is present / typing.
export function AssistantMark({
  size = "md",
  live = false,
  className
}: {
  size?: "sm" | "md" | "lg";
  live?: boolean;
  className?: string;
}) {
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const icon = size === "sm" ? "h-[1.05rem] w-[1.05rem]" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const radius = size === "lg" ? "rounded-[1.1rem]" : "rounded-2xl";

  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", dim, className)}>
      {live && (
        <span
          className={cn(
            "absolute inset-0 animate-ping bg-emerald-400/25 [animation-duration:2.4s]",
            radius
          )}
        />
      )}
      <span
        className={cn(
          "relative grid h-full w-full place-items-center overflow-hidden text-white ring-1 ring-emerald-900/25",
          "bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-900",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-10px_rgba(12,122,87,0.85)]",
          radius
        )}
      >
        {/* a soft diagonal sheen so the tile reads as glass, not flat fill */}
        <span className="pointer-events-none absolute -inset-y-3 -left-1.5 w-1/2 -rotate-12 bg-white/15 blur-md" />
        <Compass className={cn("relative", icon)} strokeWidth={1.9} />
      </span>
    </span>
  );
}
