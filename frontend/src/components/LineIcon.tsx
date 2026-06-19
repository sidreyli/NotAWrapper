type IconName = "home" | "bag" | "health" | "people" | "bill" | "shield" | "doc" | "lock" | "tag" | "clock";

const paths: Record<IconName, JSX.Element> = {
  home: <path d="M4 11.5 12 5l8 6.5v8H6v-8m4 8v-5h4v5m-5-8h2.5v2.5H9zm5.5 0H17v2.5h-2.5z" />,
  bag: <path d="M8 9V7a4 4 0 0 1 8 0v2m-10 .5h12l-1 11H7zM10 13h4m-4 4h4" />,
  health: <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.4-7 10-7 10zm0-9v4m-2-2h4" />,
  people: <path d="M8 19v-4a4 4 0 0 1 8 0v4M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7 8v-3a3 3 0 0 0-3-3m3-5a2 2 0 1 1-1.2 3.6" />,
  bill: <path d="M7 4h10v16H7zm3 5h4m-4 4h4m-2 4h2" />,
  shield: <path d="M12 3 5.5 5.8v5.6c0 4.1 2.8 7.7 6.5 8.6 3.7-.9 6.5-4.5 6.5-8.6V5.8zm-3 9 2 2 4-4" />,
  doc: <path d="M8 4h6l4 4v12H8zm6 0v5h4m-6 4h4m-4 4h4" />,
  lock: <path d="M7 11h10v9H7zm2 0V8a3 3 0 0 1 6 0v3" />,
  tag: <path d="M4 11V5h6l10 10-6 6zm4-3h.1" />,
  clock: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v5l3 2" />
};

export function LineIcon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`line-icon h-7 w-7 ${className}`}>
      {paths[name]}
    </svg>
  );
}
