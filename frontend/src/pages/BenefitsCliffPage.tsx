import { useEffect, useState } from "react";
import { BenefitCliffChart } from "../components/BenefitCliffChart";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { calculateCliff } from "../lib/api";
import { makeSampleCliff } from "../lib/sampleData";
import { useAppState } from "../state/AppState";
import type { CliffResponse } from "../types/api";

export function BenefitsCliffPage({ navigate }: { navigate: (path: string) => void }) {
  const { profile } = useAppState();
  const [maxIncome, setMaxIncome] = useState(5000);
  const [cliff, setCliff] = useState<CliffResponse>(() => makeSampleCliff(profile));

  useEffect(() => {
    calculateCliff(profile, maxIncome).then(setCliff);
  }, [profile, maxIncome]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="display-heading max-w-4xl text-6xl text-dark">What happens to your benefits if your income changes?</h1>
      <p className="mt-6 max-w-4xl text-xl leading-8 text-muted">
        Sometimes a raise can briefly leave a household with less overall, because some benefits phase out. This is called a benefits cliff.
      </p>
      <div className="my-8 flex flex-wrap items-center gap-4">
        <label className="font-bold text-muted" htmlFor="maxIncome">Max income</label>
        <input
          id="maxIncome"
          type="range"
          min="3000"
          max="10000"
          step="500"
          value={maxIncome}
          onChange={(event) => setMaxIncome(Number(event.target.value))}
          className="accent-teal"
        />
        <span className="font-extrabold">${maxIncome.toLocaleString()}/mo</span>
      </div>
      <BenefitCliffChart cliff={cliff} />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {cliff.cliff_zones.map((zone) => (
          <Card key={`${zone.income_start}-${zone.income_end}`} className="border-amber-200 bg-amber-50 p-6">
            <h2 className="font-display text-3xl font-black text-warning">Cliff zone</h2>
            <p className="mt-3 text-lg text-slate-700">{zone.description}</p>
            <p className="mt-4 font-bold">Income range: ${zone.income_start.toLocaleString()} - ${zone.income_end.toLocaleString()}</p>
            <p className="font-bold">Benefit affected: {zone.benefit_lost}</p>
          </Card>
        ))}
        <Card className="border-green-200 bg-green-50 p-6">
          <h2 className="font-display text-3xl font-black text-success">How to read this</h2>
          <p className="mt-3 text-lg text-slate-700">
            The teal line combines monthly income and estimated benefit value. A dip means benefits phase out faster than income rises.
          </p>
        </Card>
      </div>
      <Button className="mt-8" variant="secondary" onClick={() => navigate("/results")}>Back to results</Button>
    </section>
  );
}
