import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { BenefitsCliffPage } from "./pages/BenefitsCliffPage";
import { CheckEligibilityPage } from "./pages/CheckEligibilityPage";
import { ChecklistPage } from "./pages/ChecklistPage";
import { LandingPage } from "./pages/LandingPage";
import { ProgramDetailPage } from "./pages/ProgramDetailPage";
import { ResultsPage } from "./pages/ResultsPage";

function currentPath() {
  return window.location.pathname;
}

function parseProgramRoute(path: string) {
  const checklistMatch = path.match(/^\/programs\/([^/]+)\/checklist$/);
  if (checklistMatch) {
    return { type: "checklist" as const, programId: checklistMatch[1] };
  }
  const detailMatch = path.match(/^\/programs\/([^/]+)$/);
  if (detailMatch) {
    return { type: "detail" as const, programId: detailMatch[1] };
  }
  return null;
}

export function App() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = useMemo(() => {
    const programRoute = parseProgramRoute(path);
    if (programRoute?.type === "checklist") {
      return <ChecklistPage navigate={navigate} programId={programRoute.programId} />;
    }
    if (programRoute?.type === "detail") {
      return <ProgramDetailPage navigate={navigate} programId={programRoute.programId} />;
    }
    if (path === "/check-eligibility") return <CheckEligibilityPage navigate={navigate} />;
    if (path === "/results") return <ResultsPage navigate={navigate} />;
    if (path === "/benefits-cliff") return <BenefitsCliffPage navigate={navigate} />;
    return <LandingPage navigate={navigate} />;
  }, [path]);

  return <AppShell navigate={navigate}>{content}</AppShell>;
}
