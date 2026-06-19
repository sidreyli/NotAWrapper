"use client";

import { useState } from "react";
import { ExternalLink, Check, ChevronDown, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { EligibilityResult } from "@/lib/types";

export function ProgramCard({
  result,
  index,
}: {
  result: EligibilityResult;
  index: number;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [docsOpen, setDocsOpen] = useState(false);

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card"
    >
      {/* header */}
      <div className="flex items-start justify-between gap-4 border-b border-line p-6 pb-5">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-faint">
            Program · {result.program_id}
          </p>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-navy">
            {result.program_name}
          </h3>
        </div>
        <StatusBadge status={result.status} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.95rem] leading-relaxed text-ink">{result.reason}</p>

        {result.estimated_monthly_benefit && (
          <div className="mt-5 flex items-baseline gap-2 rounded-md border border-brass/30 bg-brass-wash px-4 py-3">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-brass">
              Est. benefit
            </span>
            <span className="num text-lg font-semibold text-navy">
              {result.estimated_monthly_benefit}
            </span>
          </div>
        )}

        {/* eligibility factors */}
        {result.eligibility_factors.length > 0 && (
          <dl className="mt-5 space-y-2">
            {result.eligibility_factors.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-sm bg-paper px-3 py-2 text-sm"
              >
                <span
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full",
                    f.passes ? "bg-ok-wash text-ok" : "bg-none-wash text-none"
                  )}
                >
                  {f.passes ? (
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-none" />
                  )}
                </span>
                <span className="text-muted">{f.factor_name}</span>
                <span className="num ml-auto text-ink">{f.user_value}</span>
                {f.threshold !== "—" && (
                  <span className="num text-faint">/ {f.threshold}</span>
                )}
              </div>
            ))}
          </dl>
        )}

        {/* documents */}
        {result.required_documents.length > 0 && (
          <div className="mt-5 rounded-md border border-line">
            <button
              onClick={() => setDocsOpen((v) => !v)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
              aria-expanded={docsOpen}
            >
              <FileText className="h-4 w-4 text-navy" strokeWidth={1.8} />
              <span className="text-sm font-medium text-navy">
                Documents to gather
              </span>
              <span className="num ml-1 text-xs text-faint">
                {checked.size}/{result.required_documents.length}
              </span>
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 text-faint transition-transform",
                  docsOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {docsOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-line"
                >
                  {result.required_documents.map((d, i) => (
                    <li key={i}>
                      <button
                        onClick={() => toggle(i)}
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-paper"
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
                            checked.has(i)
                              ? "border-ok bg-ok text-white"
                              : "border-line-strong"
                          )}
                        >
                          {checked.has(i) && (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-sm leading-snug",
                            checked.has(i)
                              ? "text-faint line-through"
                              : "text-muted"
                          )}
                        >
                          {d}
                        </span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-6 py-4">
        <p className="font-mono text-[0.62rem] leading-tight text-faint">
          Source: {result.data_source}
          {result.data_as_of ? `, ${result.data_as_of}` : ""}
        </p>
        {result.apply_url && (
          <a
            href={result.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-navy px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            Apply here
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
