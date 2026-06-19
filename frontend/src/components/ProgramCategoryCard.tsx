import { Card } from "./Card";
import { LineIcon } from "./LineIcon";

export function ProgramCategoryCard({
  icon,
  name,
  category,
  description,
  tint = "bg-softAqua"
}: {
  icon: Parameters<typeof LineIcon>[0]["name"];
  name: string;
  category: string;
  description: string;
  tint?: string;
}) {
  return (
    <Card className="p-7">
      <div className="mb-5 flex items-center gap-5">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-lineInk ${tint}`}>
          <LineIcon name={icon} />
        </div>
        <div>
          <h3 className="font-display text-3xl font-black text-dark">{name}</h3>
          <p className="text-muted">{category}</p>
        </div>
      </div>
      <p className="text-lg leading-7 text-slate-700">{description}</p>
    </Card>
  );
}
