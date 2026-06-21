import { useT } from "@/i18n";
import { Logo } from "./Logo";

export function Footer({ navigate }: { navigate: (path: string) => void }) {
  const t = useT();
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo onClick={() => navigate("/")} />
          <p className="mt-4 max-w-xs text-sm leading-6 text-haze">{t("footer.tagline")}</p>
        </div>
        <nav className="flex flex-col gap-2.5 text-sm text-haze">
          <p className="mb-1 font-semibold text-ink">{t("footer.exploreHeading")}</p>
          <button className="text-left transition hover:text-ink" onClick={() => navigate("/check-eligibility")}>
            {t("common.checkEligibility")}
          </button>
          <button className="text-left transition hover:text-ink" onClick={() => navigate("/results")}>
            {t("footer.yourResults")}
          </button>
          <button className="text-left transition hover:text-ink" onClick={() => navigate("/benefits-cliff")}>
            {t("footer.benefitsCliff")}
          </button>
        </nav>
        <div className="text-sm leading-6 text-haze">
          <p className="mb-1 font-semibold text-ink">{t("footer.finePrintHeading")}</p>
          <p>{t("footer.finePrint")}</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-haze sm:flex-row">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.privacyNote")}</p>
        </div>
      </div>
    </footer>
  );
}
