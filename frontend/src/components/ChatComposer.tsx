import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useT } from "@/i18n";

// Auto-growing composer with Enter-to-send (Shift+Enter for newline). Disabled
// while the assistant is thinking.
export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Type your answer…"
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const t = useT();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="flex items-end gap-2 rounded-[1.6rem] border border-border bg-paper p-2 pl-4 shadow-soft transition focus-within:border-emerald-300 focus-within:shadow-glow">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        className="max-h-[168px] flex-1 resize-none bg-transparent py-2.5 text-[0.97rem] leading-6 text-ink outline-none placeholder:text-haze/70 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label={t("composer.send")}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_8px_20px_-10px_rgba(12,122,87,0.9)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-muted disabled:text-haze disabled:shadow-none"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
      </button>
    </div>
  );
}
