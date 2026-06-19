import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid place-items-center rounded-[9px] bg-navy text-white shadow-xs",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[58%] w-[58%]"
        fill="none"
        stroke="currentColor"
      >
        {/* compass ring */}
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.32)" strokeWidth="1.4" />
        {/* needle — brass north, white south */}
        <path d="M12 4.5 L14.4 12 L12 11 L9.6 12 Z" fill="#c7a566" stroke="none" />
        <path d="M12 19.5 L9.6 12 L12 13 L14.4 12 Z" fill="#ffffff" stroke="none" />
        <circle cx="12" cy="12" r="1.1" fill="#0c2340" stroke="#c7a566" strokeWidth="0.8" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-tight text-navy">
          Benefits Navigator
        </span>
        <span className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-faint">
          Public Benefits · FY2026
        </span>
      </span>
    </span>
  );
}
