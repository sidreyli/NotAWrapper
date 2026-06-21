import { Fragment } from "react";

// Renders a translated string that may contain <em>…</em> markers, styling the
// emphasized fragments without forcing translators to deal with raw JSX. The
// <em> tags travel with the string through translation, so word order stays
// correct in every language.
export function RichText({
  text,
  emphasisClassName
}: {
  text: string;
  emphasisClassName?: string;
}) {
  const parts = text.split(/<em>(.*?)<\/em>/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className={emphasisClassName}>
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
