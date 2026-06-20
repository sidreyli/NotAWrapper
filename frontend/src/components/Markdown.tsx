import { Fragment, type ReactNode } from "react";

// A small, safe markdown renderer for LLM output. It handles the subset the model
// actually produces — headings, **bold**, *italic*, `code`, links, and bullet /
// numbered lists — and never injects raw HTML. This replaces the raw "**" that
// leaked into the chat and the action plan.

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, match.index)}</Fragment>);
    }
    const token = match[0];
    if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-bold text-dark">
          {match[2] ?? match[3]}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyBase}-c${i}`}
          className="rounded bg-softAqua px-1.5 py-0.5 font-mono text-[0.88em] text-deep"
        >
          {match[6]}
        </code>
      );
    } else if (token.startsWith("[")) {
      nodes.push(
        <a
          key={`${keyBase}-l${i}`}
          href={match[8]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-teal underline underline-offset-2 hover:text-deep"
        >
          {match[7]}
        </a>
      );
    } else {
      nodes.push(<em key={`${keyBase}-i${i}`}>{match[4] ?? match[5]}</em>);
    }
    last = match.index + token.length;
    i++;
  }

  if (last < text.length) {
    nodes.push(<Fragment key={`${keyBase}-end`}>{text.slice(last)}</Fragment>);
  }
  return nodes;
}

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const HEADING = /^(#{1,3})\s+(.*)$/;

export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length;
      const cls = level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base";
      blocks.push(
        <p key={key} className={`mt-1 font-display font-black text-dark ${cls}`}>
          {renderInline(heading[2], `h${key}`)}
        </p>
      );
      key++;
      i++;
      continue;
    }

    if (BULLET.test(line)) {
      const items: string[] = [];
      while (i < lines.length && BULLET.test(lines[i])) {
        items.push(lines[i].replace(BULLET, ""));
        i++;
      }
      blocks.push(
        <ul key={key} className="space-y-1.5">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-2.5">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" />
              <span>{renderInline(it, `ul${key}-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );
      key++;
      continue;
    }

    if (NUMBERED.test(line)) {
      const items: string[] = [];
      while (i < lines.length && NUMBERED.test(lines[i])) {
        items.push(lines[i].replace(NUMBERED, ""));
        i++;
      }
      blocks.push(
        <ol key={key} className="space-y-2">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-softAqua text-sm font-black text-deep">
                {idx + 1}
              </span>
              <span className="pt-0.5">{renderInline(it, `ol${key}-${idx}`)}</span>
            </li>
          ))}
        </ol>
      );
      key++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING.test(lines[i]) &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key} className="leading-relaxed">
        {para.map((p, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <br />}
            {renderInline(p, `p${key}-${idx}`)}
          </Fragment>
        ))}
      </p>
    );
    key++;
  }

  return <div className={`space-y-2.5 ${className}`}>{blocks}</div>;
}
