import React from "react";

// Lightweight renderer for the AI action-plan text. Handles **bold**,
// heading-style bold lines, and paragraph spacing — no external markdown dep.
function renderInline(text: string, keyBase: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-navy">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>;
  });
}

export function ActionPlanText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-4">
      {blocks.map((block, bi) => {
        const trimmed = block.trim();
        // A whole-line bold becomes a small section heading
        const headingMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
        if (headingMatch) {
          return (
            <h3
              key={bi}
              className="pt-2 text-base font-semibold tracking-tight text-navy"
            >
              {headingMatch[1]}
            </h3>
          );
        }
        // Multi-line block — render line by line
        const lines = trimmed.split("\n");
        return (
          <p key={bi} className="text-[0.95rem] leading-relaxed text-muted">
            {lines.map((line, li) => (
              <React.Fragment key={li}>
                {renderInline(line, `${bi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
