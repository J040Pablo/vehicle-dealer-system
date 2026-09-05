import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  accentClassName?: string;
  tooltipText?: string;
}

export function StatCard({ label, value, icon: Icon, isLoading, accentClassName, tooltipText }: StatCardProps) {
  const content = (
    <Card className="transition-all duration-200 hover:border-foreground/20 border-border bg-card shadow-none">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground border border-border/60",
            accentClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold tabular-nums text-foreground tracking-tight">{value}</p>
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
