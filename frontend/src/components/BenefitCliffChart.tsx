import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { CliffResponse } from "@/types/api";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function BenefitCliffChart({ cliff }: { cliff: CliffResponse }) {
  const data = cliff.data_points.map((p) => ({
    income: p.monthly_income,
    total: p.net_resources,
    benefits: p.total_benefit_value
  }));

  return (
    <div className="rounded-3xl border border-border bg-paper p-5 shadow-soft sm:p-6">
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C7A57" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#0C7A57" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E2E9E3" vertical={false} />
          <XAxis
            dataKey="income"
            tickFormatter={money}
            tick={{ fill: "#5B6E64", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={money}
            tick={{ fill: "#5B6E64", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          {cliff.cliff_zones.map((zone) => (
            <ReferenceArea
              key={`${zone.income_start}-${zone.income_end}`}
              x1={zone.income_start}
              x2={zone.income_end}
              fill="#E1962B"
              fillOpacity={0.12}
            />
          ))}
          <Tooltip
            cursor={{ stroke: "#A3DCBF", strokeWidth: 1.5 }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E2E9E3",
              boxShadow: "0 20px 50px -24px rgba(8,38,28,0.3)",
              fontSize: 13
            }}
            labelFormatter={(v) => `Income: ${money(Number(v))}/mo`}
            formatter={(value, name) => [
              money(Number(value)),
              name === "total" ? "Total resources" : "Benefit value"
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#0C7A57"
            strokeWidth={2.5}
            fill="url(#totalFill)"
            dot={false}
            activeDot={{ r: 5, fill: "#0C7A57" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
