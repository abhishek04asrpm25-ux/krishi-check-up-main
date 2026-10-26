import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", inverse ? "bg-card text-primary" : "bg-hero text-primary-foreground")}>
        <Sprout className="size-5" />
      </span>
      <div className="leading-tight">
        <p className={cn("font-display text-lg font-bold", inverse && "text-primary-foreground")}>KrishiConnect</p>
        <p className={cn("text-xs", inverse ? "text-primary-foreground/80" : "text-muted-foreground")}>Know Before You Go</p>
      </div>
    </div>
  );
}
