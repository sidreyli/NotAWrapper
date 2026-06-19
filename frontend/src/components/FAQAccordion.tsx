import { useState } from "react";

export function FAQAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {items.map((item, index) => (
        <div key={item.question} className="rounded-2xl border border-border bg-surface">
          <button
            className="flex w-full items-center justify-between gap-4 px-7 py-6 text-left text-xl font-extrabold"
            onClick={() => setOpen(open === index ? -1 : index)}
            type="button"
          >
            {item.question}
            <span className="text-teal">{open === index ? "-" : "+"}</span>
          </button>
          {open === index && <p className="px-7 pb-6 text-lg leading-8 text-slate-700">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}
