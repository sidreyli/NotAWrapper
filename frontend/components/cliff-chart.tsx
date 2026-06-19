"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { CliffDataPoint, CliffZone } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const W = 1000;
const H = 440;
const PAD = { l: 64, r: 28, t: 28, b: 46 };

type Props = {
  points: CliffDataPoint[];
  zones?: CliffZone[];
  currentIncome?: number | null;
  interactive?: boolean;
  animate?: boolean;
  className?: string;
};

export function CliffChart({
  points,
  zones = [],
  currentIncome = null,
  interactive = true,
  animate = true,
  className,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { xMax, yMax, netPath, areaPath, incomePath, x, y } = useMemo(() => {
    const xMax = points.length ? points[points.length - 1].monthly_income : 5000;
    const yMaxRaw = Math.max(...points.map((p) => p.net_resources), 1);
    const yMax = Math.ceil(yMaxRaw / 500) * 500;
    const x = (income: number) =>
      PAD.l + (income / xMax) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - v / yMax) * (H - PAD.t - PAD.b);

    const net = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.monthly_income)} ${y(p.net_resources)}`)
      .join(" ");
    const area =
      net +
      ` L ${x(xMax)} ${y(0)} L ${x(0)} ${y(0)} Z`;
    const income = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.monthly_income)} ${y(p.monthly_income)}`)
      .join(" ");

    return { xMax, yMax, netPath: net, areaPath: area, incomePath: income, x, y };
  }, [points]);

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let v = 0; v <= xMax; v += 1000) ticks.push(v);
    return ticks;
  }, [xMax]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let v = 0; v <= yMax; v += yMax >= 4000 ? 2000 : 1000) ticks.push(v);
    return ticks;
  }, [yMax]);

  function onMove(e: React.PointerEvent) {
    if (!interactive || !svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const income = ((px - PAD.l) / (W - PAD.l - PAD.r)) * xMax;
    const step = points[1] ? points[1].monthly_income - points[0].monthly_income : 50;
    let idx = Math.round(income / step);
    idx = Math.max(0, Math.min(points.length - 1, idx));
    setHoverIdx(idx);
  }

  const active = hoverIdx != null ? points[hoverIdx] : null;
  const curIdx =
    currentIncome != null
      ? points.reduce(
          (best, p, i) =>
            Math.abs(p.monthly_income - currentIncome) <
            Math.abs(points[best].monthly_income - currentIncome)
              ? i
              : best,
          0
        )
      : null;
  const cur = curIdx != null ? points[curIdx] : null;

  return (
    <div className={className}>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full select-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHoverIdx(null)}
          role="img"
          aria-label="Total monthly resources as income rises, showing benefit cliff zones"
        >
          <defs>
            <linearGradient id="netfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e4a7c" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#1e4a7c" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* horizontal gridlines */}
          {yTicks.map((v) => (
            <g key={`y${v}`}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y(v)}
                y2={y(v)}
                stroke="#e3e6ec"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 12}
                y={y(v) + 4}
                textAnchor="end"
                className="fill-faint"
                style={{ fontSize: 16, fontFamily: "var(--font-mono)" }}
              >
                {v >= 1000 ? `${v / 1000}k` : v}
              </text>
            </g>
          ))}

          {/* cliff zone bands */}
          {zones.map((z, i) => (
            <g key={`z${i}`}>
              <rect
                x={x(z.income_start)}
                y={PAD.t}
                width={Math.max(x(z.income_end) - x(z.income_start), 6)}
                height={H - PAD.t - PAD.b}
                fill="#b65a1c"
                opacity={0.08}
              />
              <line
                x1={x(z.income_start)}
                x2={x(z.income_start)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="#b65a1c"
                strokeWidth={1}
                strokeDasharray="3 4"
                opacity={0.5}
              />
            </g>
          ))}

          {/* income-only reference (earn a dollar, keep a dollar) */}
          <path
            d={incomePath}
            fill="none"
            stroke="#91a8c4"
            strokeWidth={1.5}
            strokeDasharray="5 6"
          />

          {/* net resources area + line */}
          <motion.path
            d={areaPath}
            fill="url(#netfill)"
            initial={animate ? { opacity: 0 } : false}
            whileInView={animate ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
          />
          <motion.path
            d={netPath}
            fill="none"
            stroke="#0c2340"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0 } : false}
            whileInView={animate ? { pathLength: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* current income marker */}
          {cur && (
            <g>
              <line
                x1={x(cur.monthly_income)}
                x2={x(cur.monthly_income)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="#b08736"
                strokeWidth={1.5}
              />
              <circle
                cx={x(cur.monthly_income)}
                cy={y(cur.net_resources)}
                r={5.5}
                fill="#b08736"
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={x(cur.monthly_income)}
                y={PAD.t - 9}
                textAnchor="middle"
                className="fill-brass"
                style={{ fontSize: 14, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
              >
                YOU
              </text>
            </g>
          )}

          {/* hover guide */}
          {active && (
            <g>
              <line
                x1={x(active.monthly_income)}
                x2={x(active.monthly_income)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="#0c2340"
                strokeWidth={1}
                opacity={0.25}
              />
              <circle
                cx={x(active.monthly_income)}
                cy={y(active.net_resources)}
                r={5}
                fill="#0c2340"
                stroke="#fff"
                strokeWidth={2}
              />
            </g>
          )}

          {/* x axis ticks */}
          {xTicks.map((v) => (
            <text
              key={`x${v}`}
              x={x(v)}
              y={H - PAD.b + 26}
              textAnchor="middle"
              className="fill-faint"
              style={{ fontSize: 16, fontFamily: "var(--font-mono)" }}
            >
              ${v >= 1000 ? `${v / 1000}k` : v}
            </text>
          ))}
          <text
            x={(W - PAD.r + PAD.l) / 2}
            y={H - 6}
            textAnchor="middle"
            className="fill-faint"
            style={{ fontSize: 14, fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            MONTHLY INCOME →
          </text>
        </svg>

        {/* tooltip */}
        {interactive && active && (
          <Tooltip point={active} xPct={(x(active.monthly_income) / W) * 100} />
        )}
      </div>
    </div>
  );
}

function Tooltip({ point, xPct }: { point: CliffDataPoint; xPct: number }) {
  const rows: [string, number, string][] = [
    ["SNAP", point.snap_benefit, "bg-[#2f6b4f]"],
    ["Medicaid", point.medicaid_value, "bg-[#2b5b88]"],
    ["CHIP", point.chip_value, "bg-[#1e4a7c]"],
    ["LIHEAP", point.liheap_value, "bg-[#9a6a1f]"],
    ["WIC", point.wic_value, "bg-[#b08736]"],
  ];
  const onRight = xPct > 60;
  return (
    <div
      className="pointer-events-none absolute top-3 z-10 w-56 rounded-md border border-line bg-surface/95 p-3.5 shadow-lift backdrop-blur"
      style={
        onRight
          ? { right: `${100 - xPct + 2}%` }
          : { left: `${xPct + 2}%` }
      }
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
        Income {formatMoney(point.monthly_income)}/mo
      </p>
      <p className="mt-1 text-lg font-semibold text-navy num">
        {formatMoney(point.net_resources)}
        <span className="ml-1 text-xs font-normal text-muted">net resources</span>
      </p>
      <div className="mt-3 space-y-1.5">
        {rows.map(([label, val, color]) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-[3px] ${color} ${val === 0 ? "opacity-25" : ""}`} />
            <span className={val === 0 ? "text-faint" : "text-muted"}>{label}</span>
            <span className={`ml-auto num ${val === 0 ? "text-faint" : "text-ink"}`}>
              {val === 0 ? "—" : formatMoney(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
