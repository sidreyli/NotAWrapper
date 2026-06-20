// Text-only wordmark for the navbar — no glyph tile, just the name set in the
// display face with a single gold accent dot. Always light, for the emerald bar.
export function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
      aria-label="Aid Compass home"
    >
      <span className="font-display text-[1.45rem] font-semibold leading-none tracking-[-0.02em] text-white">
        Aid Compass
      </span>
      <span className="h-1.5 w-1.5 translate-y-[3px] rounded-full bg-gold-300 transition group-hover:scale-125" />
    </button>
  );
}

// "Aid Compass" wordmark — a sun cresting an arc, in emerald with a gold sun.
// `tone="light"` flips the wordmark to white for use over the dark emerald hero.
export function Logo({ onClick, tone = "dark" }: { onClick?: () => void; tone?: "dark" | "light" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Aid Compass home"
    >
      <span
        className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl ${
          tone === "light" ? "bg-white/15 ring-1 ring-white/25 backdrop-blur" : "bg-ink"
        }`}
      >
        <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden>
          <circle cx="18" cy="22" r="6.5" fill="#E1962B" />
          <path d="M5 25.5 H31" stroke="#2FA277" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M8 25.5 a10 10 0 0 1 20 0"
            fill="none"
            stroke="#7FE3B8"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <span
        className={`font-display text-[1.35rem] font-semibold leading-none tracking-[-0.02em] ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        Aid Compass
      </span>
    </button>
  );
}
