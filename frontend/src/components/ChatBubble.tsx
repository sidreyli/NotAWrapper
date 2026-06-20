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
        <div className="max-w-[80%] rounded-[1.4rem] rounded-br-md bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-3 text-[0.97rem] font-medium leading-7 text-white shadow-[0_12px_28px_-14px_rgba(12,122,87,0.85)]">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex animate-msg-in items-start gap-3">
      <AssistantMark size="sm" className="mt-0.5" />
      <div className="max-w-[85%] rounded-[1.4rem] rounded-tl-md bg-white px-5 py-4 shadow-soft ring-1 ring-emerald-900/[0.06]">
        <Markdown content={content} className="text-ink/90" />
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex animate-msg-in items-start gap-3">
      <AssistantMark size="sm" live className="mt-0.5" />
      <div className="flex items-center gap-1.5 rounded-[1.4rem] rounded-tl-md bg-white px-5 py-4 shadow-soft ring-1 ring-emerald-900/[0.06]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
          />
        ))}
      </div>
    </div>
  );
}
