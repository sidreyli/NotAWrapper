import {
  Apple,
  Baby,
  Flame,
  HandCoins,
  HeartPulse,
  ShoppingBasket,
  type LucideIcon
} from "lucide-react";

export interface ProgramMeta {
  icon: LucideIcon;
  category: string;
  blurb: string;
  /** tailwind classes for the glyph tile: [bg, fg] */
  tile: string;
  text: string;
}

// Per-program identity: icon, one-line plain-language blurb, and an on-brand tint.
// Kept restrained — emerald is the anchor, others add just enough variety.
export const PROGRAMS: Record<string, ProgramMeta> = {
  snap: {
    icon: ShoppingBasket,
    category: "Food assistance",
    blurb: "Monthly grocery money on a card for low-income households.",
    tile: "bg-emerald-50",
    text: "text-emerald-600"
  },
  medicaid: {
    icon: HeartPulse,
    category: "Health coverage",
    blurb: "Free or low-cost comprehensive health coverage for adults.",
    tile: "bg-[#E7F0FA]",
    text: "text-sky"
  },
  wic: {
    icon: Apple,
    category: "Nutrition",
    blurb: "Food and nutrition support during pregnancy and early childhood.",
    tile: "bg-[#FBEFE8]",
    text: "text-clay"
  },
  liheap: {
    icon: Flame,
    category: "Utilities",
    blurb: "Help paying home heating and cooling bills.",
    tile: "bg-gold-50",
    text: "text-gold-600"
  },
  chip: {
    icon: Baby,
    category: "Children's health",
    blurb: "Low-cost coverage for children above the Medicaid limit.",
    tile: "bg-[#EFEBFB]",
    text: "text-lilac"
  },
  tanf: {
    icon: HandCoins,
    category: "Cash assistance",
    blurb: "Short-term cash help for families with children.",
    tile: "bg-emerald-50",
    text: "text-emerald-600"
  }
};

export function programMeta(id: string): ProgramMeta {
  return PROGRAMS[id] ?? PROGRAMS.snap;
}

export function ProgramGlyph({
  id,
  className = "h-12 w-12",
  iconClassName = "h-6 w-6"
}: {
  id: string;
  className?: string;
  iconClassName?: string;
}) {
  const meta = programMeta(id);
  const Icon = meta.icon;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl ${meta.tile} ${meta.text} ${className}`}
    >
      <Icon className={iconClassName} strokeWidth={1.75} />
    </span>
  );
}
