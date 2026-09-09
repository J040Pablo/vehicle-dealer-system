import * as React from "react";
import { cn } from "@/shared/lib/utils";
import carWhiteImg from "@/assets/carWhite.jpg";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  iconOnly?: boolean;
  textClassName?: string;
}

export function Logo({
  size = "md",
  showText = true,
  iconOnly = false,
  className,
  textClassName,
  ...props
}: LogoProps) {
  const iconSizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-14 w-14 rounded-2xl",
  }[size];

  const titleSizeClasses = {
    sm: "text-xs font-bold",
    md: "text-sm font-bold",
    lg: "text-2xl font-extrabold",
  }[size];

  const subtitleSizeClasses = {
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
  }[size];

  return (
    <div className={cn("flex items-center gap-3 select-none", className)} {...props}>
      {/* Official carWhite Brand Asset */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-black p-0.5 shadow-md transition-transform hover:scale-105 border border-white/10",
          iconSizeClasses
        )}
      >
        <img
          src={carWhiteImg}
          alt="Vehicle Dealer System Logo"
          className="h-full w-full object-cover rounded-md"
        />
      </div>

      {/* Brand Text */}
      {showText && !iconOnly && (
        <div className={cn("flex flex-col min-w-0 leading-tight", textClassName)}>
          <span className={cn("tracking-tight text-foreground truncate", titleSizeClasses)}>
            Vehicle Dealer
          </span>
          <span className={cn("font-medium text-muted-foreground truncate", subtitleSizeClasses)}>
            Management System
          </span>
        </div>
      )}
    </div>
  );
}
