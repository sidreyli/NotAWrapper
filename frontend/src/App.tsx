import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";

const ActionCenterPage = lazy(() => import("./pages/ActionCenterPage").then((module) => ({ default: module.ActionCenterPage })));
const BenefitsCliffPage = lazy(() => import("./pages/BenefitsCliffPage").then((module) => ({ default: module.BenefitsCliffPage })));
const CheckEligibilityPage = lazy(() => import("./pages/CheckEligibilityPage").then((module) => ({ default: module.CheckEligibilityPage })));
const ChecklistPage = lazy(() => import("./pages/ChecklistPage").then((module) => ({ default: module.ChecklistPage })));
const LandingPage = lazy(() => import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const ProgramDetailPage = lazy(() => import("./pages/ProgramDetailPage").then((module) => ({ default: module.ProgramDetailPage })));
const ResultsPage = lazy(() => import("./pages/ResultsPage").then((module) => ({ default: module.ResultsPage })));

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

  const { content, chrome } = useMemo(() => {
    const programRoute = parseProgramRoute(path);
    if (programRoute?.type === "checklist") {
      return { content: <ChecklistPage navigate={navigate} programId={programRoute.programId} />, chrome: true };
    }
    if (programRoute?.type === "detail") {
      return { content: <ProgramDetailPage navigate={navigate} programId={programRoute.programId} />, chrome: true };
    }
    if (path === "/check-eligibility")
      return { content: <CheckEligibilityPage navigate={navigate} />, chrome: false };
    if (path === "/action-center" || path.startsWith("/action-center/"))
      return { content: <ActionCenterPage navigate={navigate} path={path} />, chrome: true };
    if (path === "/results") return { content: <ResultsPage navigate={navigate} />, chrome: true };
    if (path === "/benefits-cliff") return { content: <BenefitsCliffPage navigate={navigate} />, chrome: true };
    return { content: <LandingPage navigate={navigate} />, chrome: true };
  }, [path]);

  return (
    <AppShell navigate={navigate} chrome={chrome}>
      <Suspense fallback={<RouteFallback />}>
        {content}
      </Suspense>
    </AppShell>
  );
}

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-canvas px-6">
      <div className="text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />
        <p className="mt-4 text-sm font-semibold text-haze">Opening Aid Compass…</p>
      </div>
    </div>
  );
}
