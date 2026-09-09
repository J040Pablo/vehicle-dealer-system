import type { LucideIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/logo";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showLogo?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  showLogo = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-8 sm:p-16 text-center bg-card/40">
      {showLogo ? (
        <Logo size="md" iconOnly className="mb-1" />
      ) : Icon ? (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted shadow-inner">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : null}
      <div className="space-y-1 max-w-sm">
        <p className="text-sm font-semibold text-foreground tracking-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-2 font-medium shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
