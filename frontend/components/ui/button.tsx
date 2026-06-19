import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-navy text-white hover:bg-navy-700 shadow-navy hover:shadow-[0_22px_48px_-18px_rgba(12,35,64,0.55)]",
        brass:
          "bg-brass text-white hover:brightness-105 shadow-card",
        outline:
          "bg-surface text-navy border border-line-strong hover:border-navy/40 hover:bg-surface-2 shadow-xs",
        ghost: "text-navy hover:bg-paper-2",
        quiet:
          "text-muted hover:text-navy border border-transparent hover:border-line",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-sm",
        md: "h-11 px-5 text-[0.95rem] rounded-md",
        lg: "h-[3.25rem] px-7 text-base rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type CommonProps = VariantProps<typeof button> & { className?: string };

export function Button({
  className,
  variant,
  size,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(button({ variant, size }), className)} {...props} />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  ...props
}: CommonProps &
  Omit<React.ComponentProps<typeof Link>, "className"> & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  );
}
