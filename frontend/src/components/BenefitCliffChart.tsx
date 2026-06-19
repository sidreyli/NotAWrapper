import type { CliffResponse } from "../types/api";

export function BenefitCliffChart({ cliff }: { cliff: CliffResponse }) {
  const width = 920;
  const height = 420;
  const padding = { left: 70, right: 40, top: 36, bottom: 55 };
  const maxX = Math.max(...cliff.data_points.map((point) => point.monthly_income));
  const maxY = Math.max(...cliff.data_points.map((point) => point.net_resources));
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const x = (value: number) => padding.left + (value / maxX) * plotW;
  const y = (value: number) => padding.top + plotH - (value / maxY) * plotH;
  const line = cliff.data_points.map((point) => `${x(point.monthly_income)},${y(point.net_resources)}`).join(" ");
  const area = `${padding.left},${padding.top + plotH} ${line} ${x(maxX)},${padding.top + plotH}`;
  const currentX = x(cliff.profile.monthly_gross_income);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold text-dark">Total monthly resources vs. earned income</h2>
        <div className="flex flex-wrap gap-5 text-sm text-muted">
          <span className="flex items-center gap-2"><span className="h-1 w-5 rounded bg-teal" /> Net resources</span>
          <span className="flex items-center gap-2"><span className="h-4 border-l-2 border-dashed border-slate-400" /> Your income today</span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-amber-100 ring-1 ring-amber-200" /> Cliff zone</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[780px]">
        <defs>
          <linearGradient id="cliffFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#20C5C6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#20C5C6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={padding.top + plotH * tick} y2={padding.top + plotH * tick} stroke="#E5E7EB" />
            <text x={padding.left - 15} y={padding.top + plotH * tick + 5} textAnchor="end" fill="#94A3B8" fontSize="14">
              ${Math.round((maxY * (1 - tick)) / 100) / 10}k
            </text>
          </g>
        ))}
        {cliff.cliff_zones.map((zone) => (
          <g key={`${zone.income_start}-${zone.income_end}`}>
            <rect x={x(zone.income_start)} y={padding.top} width={x(zone.income_end) - x(zone.income_start)} height={plotH} fill="#FDECCF" opacity="0.8" />
            <text x={(x(zone.income_start) + x(zone.income_end)) / 2} y={padding.top + 24} textAnchor="middle" fill="#B45309" fontWeight="800" fontSize="14">
              CLIFF
            </text>
          </g>
        ))}
        <polygon points={area} fill="url(#cliffFill)" />
        <polyline points={line} fill="none" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={currentX} x2={currentX} y1={padding.top} y2={padding.top + plotH} stroke="#94A3B8" strokeDasharray="7 7" strokeWidth="2" />
        <rect x={currentX - 45} y={padding.top - 6} width="90" height="24" rx="6" fill="#061B1F" />
        <text x={currentX} y={padding.top + 11} textAnchor="middle" fill="white" fontSize="13" fontWeight="800">
          You: ${(cliff.profile.monthly_gross_income / 1000).toFixed(1)}k
        </text>
        {cliff.data_points.map((point) => (
          <circle key={point.monthly_income} cx={x(point.monthly_income)} cy={y(point.net_resources)} r="5" fill="white" stroke="#0F766E" strokeWidth="3">
            <title>
              Income ${point.monthly_income}: SNAP ${Math.round(point.snap_benefit)}, Medicaid ${Math.round(point.medicaid_value)}, CHIP ${Math.round(point.chip_value)}, LIHEAP ${Math.round(point.liheap_value)}, WIC ${Math.round(point.wic_value)}
            </title>
          </circle>
        ))}
        {[0, 1000, 2000, 3000, 4000, 5000].map((tick) => (
          <text key={tick} x={x(tick)} y={height - 24} textAnchor="middle" fill="#94A3B8" fontSize="14">
            ${tick / 1000}k
          </text>
        ))}
        <text x={padding.left} y={height - 4} fill="#4B5563" fontSize="13" fontWeight="700">
          Earned income per month {'->'}
        </text>
      </svg>
    </div>
  );
}
