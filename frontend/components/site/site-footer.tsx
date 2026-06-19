import Link from "next/link";
import { Wordmark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="hairline-top mt-24 bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A clearer path to public support. We map your situation to the
              programs you may qualify for — then hand you a plan you can act on.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                No PII stored · Sessions clear in 2h
              </span>
            </div>
          </div>

          <div>
            <p className="eyebrow-muted">Navigate</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/intake", label: "Guided intake" },
                { href: "/navigator", label: "Caseworker mode" },
                { href: "/results", label: "Action plan" },
                { href: "/cliff", label: "Benefits cliff" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted transition-colors hover:text-navy"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow-muted">Programs covered</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-muted">
              {["SNAP", "Medicaid", "CHIP", "LIHEAP", "WIC", "TANF"].map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl leading-relaxed">
            General information only. Final eligibility is determined by the
            agency you apply to, not by this tool. This is not legal or financial
            advice. Need help? Call 211.
          </p>
          <p className="font-mono uppercase tracking-[0.16em]">
            USAII Hackathon · CA · TX · NY · FL · IL
          </p>
        </div>
      </div>
    </footer>
  );
}
