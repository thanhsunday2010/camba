import { Badge } from "@/components/ui/badge";
import { IELTS_MODULE_META, type IeltsModule } from "@/lib/exam/ielts-module";
import { cn } from "@/lib/utils";

export function IeltsModuleBadge({
  module,
  className,
  size = "default",
}: {
  module: IeltsModule;
  className?: string;
  size?: "default" | "sm";
}) {
  const meta = IELTS_MODULE_META[module];
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-bold",
        meta.badgeClassName,
        size === "sm" && "text-xs",
        className
      )}
    >
      {meta.shortLabel}
    </Badge>
  );
}
