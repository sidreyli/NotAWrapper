import { useState } from "react";
import { ExplainabilityDrawer } from "../components/ExplainabilityDrawer";
import { ProgramDetail } from "../components/ProgramDetail";
import { useAppState } from "../state/AppState";

export function ProgramDetailPage({ navigate, programId }: { navigate: (path: string) => void; programId: string }) {
  const { profile, results, setSelectedProgramId } = useAppState();
  const result = results.find((item) => item.program_id === programId) ?? results[0];
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!result) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="display-heading text-5xl">Program not found</h1>
      </section>
    );
  }

  return (
    <>
      <ProgramDetail
        result={result}
        onBack={() => navigate("/results")}
        onChecklist={() => {
          setSelectedProgramId(result.program_id);
          navigate(`/programs/${result.program_id}/checklist`);
        }}
        onExplain={() => setDrawerOpen(true)}
      />
      <ExplainabilityDrawer result={drawerOpen ? result : null} profile={profile} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
