import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface ThemeToggleProps {
  isCollapsed?: boolean;
  className?: string;
}

export function ThemeToggle({ isCollapsed = false, className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();

  const currentLabel =
    theme === "dark" ? "Tema Escuro" : theme === "light" ? "Tema Claro" : "Tema do Sistema";

  const triggerButton = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-colors select-none",
          isCollapsed ? "h-11 w-11 p-0 flex items-center justify-center mx-auto rounded-lg" : "h-11 px-3.5 py-2 rounded-lg",
          className
        )}
        aria-label="Alternar tema de cores"
      >
        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <Sun className="h-5 w-5 shrink-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 shrink-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
        {!isCollapsed && <span className="truncate tracking-tight">{currentLabel}</span>}
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {isCollapsed ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium text-xs">
              {currentLabel}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        triggerButton
      )}

      <DropdownMenuContent side={isCollapsed ? "right" : "top"} align={isCollapsed ? "end" : "start"} className="w-44">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
          <Sun className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>Claro</span>
          {theme === "light" && <span className="ml-auto font-bold text-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
          <Moon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>Escuro</span>
          {theme === "dark" && <span className="ml-auto font-bold text-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
          <Monitor className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>Sistema</span>
          {theme === "system" && <span className="ml-auto font-bold text-foreground">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
