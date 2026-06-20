import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Premium branded button — the project-wide CTA. Pill geometry, lift-on-hover,
// emerald/gold brand variants layered on the shadcn token system.
const buttonVariants = cva(
  "group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-[transform,box-shadow,background-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 active:translate-y-px [&_svg]:size-[1.15em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-500 text-white shadow-[0_10px_30px_-12px_rgba(12,122,87,0.7)] hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_18px_40px_-14px_rgba(12,122,87,0.75)]",
        gold: "bg-gold-500 text-[#3a2606] shadow-[0_10px_30px_-12px_rgba(225,150,43,0.7)] hover:-translate-y-0.5 hover:bg-gold-600 hover:text-white",
        dark: "bg-ink text-white shadow-[0_10px_30px_-14px_rgba(10,28,22,0.8)] hover:-translate-y-0.5 hover:bg-emerald-900",
        soft: "bg-mint text-emerald-700 hover:-translate-y-0.5 hover:bg-emerald-100",
        outline:
          "border border-border bg-paper/80 text-ink backdrop-blur hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-mint/60",
        ghost: "text-emerald-700 hover:bg-mint/70",
        link: "rounded-none px-0 text-emerald-600 underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-[3.25rem] px-8 text-base",
        xl: "h-14 px-9 text-lg",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
