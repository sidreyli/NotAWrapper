import { useState, type KeyboardEvent } from "react";

export function ChatComposer({
  onSend,
  disabled,
  placeholder
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-card transition focus-within:border-teal focus-within:shadow-soft">
      <textarea
        className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-7 outline-none placeholder:text-slate-400"
        rows={1}
        value={value}
        placeholder={placeholder ?? "Type your message..."}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal to-deep text-white shadow-card transition hover:brightness-110 focus-visible:focus-ring disabled:opacity-40 disabled:hover:brightness-100"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
