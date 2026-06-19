import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "aqua" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-teal text-white shadow-card hover:bg-deep",
  secondary: "border border-border bg-surface text-dark hover:border-teal",
  aqua: "bg-aqua text-dark hover:bg-[#36d4d5]",
  ghost: "text-teal hover:bg-softAqua"
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 font-bold transition focus-visible:focus-ring ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
