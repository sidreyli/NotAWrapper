// The assistant's identity mark — a sprout inside a gradient disc. It signals
// "help that helps things grow" and gives the AI one consistent, calm presence
// across the conversation. Used in the header, every assistant bubble, and the
// typing indicator.

export function AssistantMark({ size = "md", live = false }: { size?: "sm" | "md"; live?: boolean }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <span className={`relative grid ${dim} shrink-0 place-items-center rounded-full bg-gradient-to-br from-aqua to-deep text-white shadow-card`}>
      <svg
        viewBox="0 0 24 24"
        className="h-1/2 w-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21v-9" />
        <path d="M12 12c0-2.5-1.8-4.5-4.8-4.8C7 10 9 12 12 12Z" />
        <path d="M12 12c0-3 2-5.2 5-5.5C16.8 9.8 14.8 12 12 12Z" />
      </svg>
      {live && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />
      )}
    </span>
  );
}
