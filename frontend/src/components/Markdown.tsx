import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Themed markdown for LLM output (chat replies + action plans). react-markdown +
// remark-gfm, styled to the Daybreak system. No raw HTML is ever rendered.
export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("space-y-3 text-[0.95rem] leading-7 text-ink/80", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="font-display text-lg font-semibold text-ink">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="font-display text-base font-semibold text-ink">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-sm font-bold uppercase tracking-wide text-haze">{children}</h4>
          ),
          p: ({ children }) => <p className="leading-7">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-600 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-700"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-2">{children}</ol>,
          li: ({ children }) => (
            <li className="relative pl-5 leading-7 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-400">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="rounded-md bg-mint px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-700">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-300 pl-4 text-ink/70">
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
