import { useEffect, useState } from "react";
import { useAppState } from "@/state/AppState";
import { t } from "@/lib/i18n";
import { Button } from "./Button";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";

export function Navbar({ navigate }: { navigate: (path: string) => void }) {
  const { language, setLanguage } = useAppState();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 90);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Three chrome treatments, one pill:
  //  • over the landing hero  → transparent bar, light text (floats on the shader)
  //  • inner / working pages  → deep-emerald frosted bar, light text
  //  • scrolled landing page  → frosted white bar, dark text
  const onLanding = typeof window !== "undefined" && window.location.pathname === "/";
  const overHero = onLanding && !scrolled;
  const light = overHero || !onLanding;
  const barClass = overHero
    ? "border-transparent bg-transparent"
    : onLanding
      ? "glass border-border shadow-soft"
      : "glass-emerald border-white/10 shadow-lift";

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 transition-all duration-300 ${barClass}`}
      >
        <Logo onClick={() => navigate("/")} tone={light ? "light" : "dark"} />
        <div
          className={`hidden items-center gap-7 text-sm font-medium lg:flex ${
            light ? "text-white/75" : "text-haze"
          }`}
        >
          <button
            className={`transition ${light ? "hover:text-white" : "hover:text-ink"}`}
            onClick={() => scrollTo("how-it-works")}
          >
            {t(language, "navHow")}
          </button>
          <button
            className={`transition ${light ? "hover:text-white" : "hover:text-ink"}`}
            onClick={() => scrollTo("programs")}
          >
            {t(language, "navPrograms")}
          </button>
          <button
            className={`transition ${light ? "hover:text-white" : "hover:text-ink"}`}
            onClick={() => scrollTo("trust")}
          >
            {t(language, "navWhy")}
          </button>
          <button
            className={`transition ${light ? "hover:text-white" : "hover:text-ink"}`}
            onClick={() => scrollTo("faq")}
          >
            {t(language, "navFaq")}
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <LanguageToggle language={language} onChange={setLanguage} tone={light ? "light" : "dark"} />
          <Button
            size="sm"
            variant={light ? "gold" : "primary"}
            className="hidden sm:inline-flex"
            onClick={() => navigate("/check-eligibility")}
          >
            {t(language, "checkEligibility")}
          </Button>
        </div>
      </nav>
    </header>
  );
}
