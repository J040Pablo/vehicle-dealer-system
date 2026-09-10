import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  isLoading?: boolean;
  accentClassName?: string;
  tooltipText?: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
  accentClassName,
  tooltipText,
  subtext,
  trend,
}: StatCardProps) {
  const content = (
    <Card className="transition-all duration-200 hover:border-foreground/20 border-border/60 bg-card/60 backdrop-blur-sm shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground border border-border/40",
              accentClassName
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded",
                    trend.isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
          )}

          {subtext && !isLoading && (
            <p className="text-xs text-muted-foreground font-medium pt-0.5">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (tooltipText) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="font-medium text-xs">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
