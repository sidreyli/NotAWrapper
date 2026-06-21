import { useEffect, useState } from "react";
import { useAppState } from "@/state/AppState";
import { useT } from "@/i18n";
import { Button } from "./Button";
import { LanguageToggle } from "./LanguageToggle";
import { Wordmark } from "./Logo";
import { AuthControls } from "@/auth/AuthControls";

export function Navbar({ navigate }: { navigate: (path: string) => void }) {
  const { language, setLanguage } = useAppState();
  const t = useT();
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

  // Light text throughout so the bar always belongs to the emerald world.
  //  • landing hero (top)   → floating pill, transparent over the shader
  //  • landing scrolled     → floating pill, deep-emerald frosted glass
  //  • every inner page     → full-bleed solid emerald bar (no white showing
  //                           around a pill, so the chrome reads as one piece)
  const onLanding = typeof window !== "undefined" && window.location.pathname === "/";
  const overHero = onLanding && !scrolled;

  const navItems = [
    { id: "how-it-works", label: t("nav.how") },
    { id: "programs", label: t("nav.programs") },
    { id: "trust", label: t("nav.why") },
    { id: "faq", label: t("nav.faq") }
  ];

  const inner = (
    <>
      <Wordmark onClick={() => navigate("/")} />

      <div className="hidden items-center gap-1 text-[0.95rem] font-medium text-emerald-50/85 lg:flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            className="rounded-full px-3.5 py-2 transition hover:bg-white/10 hover:text-white"
            onClick={() => scrollTo(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <AuthControls />
        <LanguageToggle language={language} onChange={setLanguage} tone="light" />
        <Button
          size="md"
          variant="gold"
          className="hidden sm:inline-flex"
          onClick={() => navigate("/action-center")}
        >
          {t("nav.actionCenter")}
        </Button>
      </div>
    </>
  );

  if (onLanding) {
    return (
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          className={`mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 rounded-[1.5rem] border px-4 transition-all duration-300 sm:h-[4.25rem] sm:px-6 ${
            overHero ? "border-white/10 bg-transparent" : "glass-emerald border-white/12"
          }`}
        >
          {inner}
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50">
      <nav className="glass-emerald border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 px-4 sm:h-[4.25rem] sm:px-6">
          {inner}
        </div>
      </nav>
    </header>
  );
}
