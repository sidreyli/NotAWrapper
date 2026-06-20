import { AssistantMark } from "./AssistantMark";
import { Markdown } from "./Markdown";

export function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex animate-msg-in justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-br from-teal to-deep px-4 py-2.5 text-[15px] leading-7 text-white shadow-card">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-msg-in items-start gap-3">
      <AssistantMark />
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 text-[15px] leading-7 text-slate-800 shadow-card">
        <Markdown content={content} />
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex animate-msg-in items-start gap-3">
      <AssistantMark />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-4 shadow-card">
        <span className="h-2 w-2 animate-bounce rounded-full bg-aqua [animation-delay:-0.25s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:-0.12s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-deep" />
      </div>
    </div>
  );
}
