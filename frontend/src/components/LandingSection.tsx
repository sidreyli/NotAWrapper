import type { ReactNode } from "react";

export function LandingSection({
  id,
  eyebrow,
  title,
  children,
  dark = false
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section id={id} className={dark ? "bg-dark py-20 text-white" : "bg-page py-20 text-dark"}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-12 text-center">
          <p className="mb-6 text-sm font-extrabold uppercase tracking-[0.22em] text-aqua">{eyebrow}</p>
          <h2 className="display-heading text-5xl md:text-6xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
