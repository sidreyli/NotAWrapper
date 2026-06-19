import { useAppState } from "../state/AppState";
import { t } from "../lib/i18n";
import { Button } from "./Button";
import { LanguageToggle } from "./LanguageToggle";

export function Navbar({ navigate }: { navigate: (path: string) => void }) {
  const { language, setLanguage } = useAppState();

  const scrollTo = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <button className="flex items-center gap-3" onClick={() => navigate("/")} type="button">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal text-aqua">
            <span className="h-4 w-4 rounded border-2 border-current" />
          </span>
          <span className="font-display text-2xl font-black text-dark">NotAWrapper</span>
        </button>
        <div className="hidden items-center gap-8 text-lg font-semibold text-muted lg:flex">
          <button onClick={() => scrollTo("how-it-works")}>{t(language, "navHow")}</button>
          <button onClick={() => scrollTo("programs")}>{t(language, "navPrograms")}</button>
          <button onClick={() => scrollTo("built-care")}>{t(language, "navWhy")}</button>
          <button onClick={() => scrollTo("faq")}>{t(language, "navFaq")}</button>
          <button onClick={() => navigate("/results")}>{t(language, "navAll")}</button>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle language={language} onChange={setLanguage} />
          <Button className="hidden sm:inline-flex" onClick={() => navigate("/check-eligibility")}>
            {t(language, "checkEligibility")}
          </Button>
        </div>
      </nav>
    </header>
  );
}
