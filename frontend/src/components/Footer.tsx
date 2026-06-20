import { Logo } from "./Logo";

export function Footer({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo onClick={() => navigate("/")} />
          <p className="mt-4 max-w-xs text-sm leading-6 text-haze">
            A friendlier front door to public benefits. We help you understand what you may qualify
            for — we never submit anything for you.
          </p>
        </div>
        <nav className="flex flex-col gap-2.5 text-sm text-haze">
          <p className="mb-1 font-semibold text-ink">Explore</p>
          <button className="text-left transition hover:text-ink" onClick={() => navigate("/check-eligibility")}>
            Check eligibility
          </button>
          <button className="text-left transition hover:text-ink" onClick={() => navigate("/results")}>
            Your results
          </button>
          <button className="text-left transition hover:text-ink" onClick={() => navigate("/benefits-cliff")}>
            Benefits cliff
          </button>
        </nav>
        <div className="text-sm leading-6 text-haze">
          <p className="mb-1 font-semibold text-ink">The fine print</p>
          <p>
            Aid Compass provides general guidance only. Final eligibility is determined by the
            agency you apply to. This is not legal or financial advice.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-haze sm:flex-row">
          <p>© {new Date().getFullYear()} Aid Compass. Built for people, not paperwork.</p>
          <p>No SSN required · Sessions clear in 2 hours</p>
        </div>
      </div>
    </footer>
  );
}
