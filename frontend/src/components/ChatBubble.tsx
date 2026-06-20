import { AssistantMark } from "./AssistantMark";
import { Markdown } from "./Markdown";

export function ChatBubble({
  role,
  content
}: {
  role: "user" | "assistant";
  content: string;
}) {
  if (role === "user") {
    return (
      <div className="flex animate-msg-in justify-end">
        <div className="max-w-[82%] rounded-[1.25rem] rounded-br-md bg-gradient-to-br from-emerald-500 to-emerald-700 px-4 py-2.5 text-[0.95rem] leading-6 text-white shadow-[0_8px_24px_-12px_rgba(12,122,87,0.8)]">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex animate-msg-in gap-3">
      <AssistantMark size="sm" />
      <div className="max-w-[88%] rounded-[1.25rem] rounded-tl-md border border-border bg-paper px-4 py-3 shadow-soft">
        <Markdown content={content} className="text-ink/85" />
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex animate-msg-in gap-3">
      <AssistantMark size="sm" live />
      <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-tl-md border border-border bg-paper px-4 py-3.5 shadow-soft">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-emerald-300"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
          />
        ))}
      </div>
    </div>
  );
}
