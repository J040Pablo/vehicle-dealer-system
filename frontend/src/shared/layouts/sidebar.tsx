import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Building2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { ThemeToggle } from "@/shared/components/theme-toggle";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/veiculos", label: "Veículos", icon: Car },
  { to: "/concessionarias", label: "Concessionárias", icon: Building2 },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  isMobileDrawer?: boolean;
  className?: string;
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
  isMobileDrawer = false,
  className,
}: SidebarProps) {
  const { pathname } = useLocation();

  const collapsed = isMobileDrawer ? false : isCollapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between border-r border-border bg-background text-foreground transition-[width] duration-300 ease-out select-none z-30 overflow-hidden",
        isMobileDrawer ? "w-full" : collapsed ? "w-[80px]" : "w-[256px]",
        className
      )}
    >
      {/* Top Section: Brand & Navigation */}
      <div className="flex flex-col">
        {/* Minimalist Logo Header */}
        <div className="flex h-16 shrink-0 items-center px-4 border-b border-border/60">
          {!collapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background font-bold text-base shadow-sm tracking-tight">
                V
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-foreground truncate">
                  Vehicle Dealer
                </span>
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  Vehicle Management System
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background font-bold text-base shadow-sm">
                V
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation Items (No Category Heading) */}
        <div className="p-3">
          <nav className="space-y-1.5">
            <LayoutGroup id="active-nav-group">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
                const isActive = end ? pathname === to : pathname.startsWith(to);

                const linkContent = (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={({ isActive: linkActive }) =>
                      cn(
                        "group relative flex items-center gap-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                        collapsed ? "h-11 w-11 mx-auto flex items-center justify-center rounded-lg" : "h-11 px-3.5 py-2 rounded-lg",
                        linkActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium"
                      )
                    }
                  >
                    {({ isActive: linkActive }) => (
                      <>
                        {/* Active Item Background Pill */}
                        {linkActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute inset-0 rounded-lg bg-accent"
                            transition={{
                              duration: 0.15,
                              ease: "easeOut",
                            }}
                          />
                        )}

                        {/* 3px Left Vertical Accent Bar (Only in expanded mode) */}
                        {linkActive && !collapsed && (
                          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-foreground z-20" />
                        )}

                        {/* Global 20px Icon (h-5 w-5 shrink-0) */}
                        <Icon
                          className={cn(
                            "relative z-10 h-5 w-5 shrink-0 transition-colors",
                            linkActive
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />

                        {/* Label */}
                        {!collapsed && (
                          <span className="relative z-10 truncate tracking-tight">{label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <TooltipProvider key={to} delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium text-xs">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return linkContent;
              })}
            </LayoutGroup>
          </nav>
        </div>
      </div>

      {/* Footer Controls: Collapse Toggle (Above) & ThemeToggle (Below) */}
      <div className="border-t border-border/60 p-3 flex flex-col space-y-1.5">
        {!isMobileDrawer && onToggleCollapse && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={onToggleCollapse}
                  aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                  className={cn(
                    "w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-colors select-none",
                    collapsed ? "h-11 w-11 p-0 mx-auto flex items-center justify-center rounded-lg" : "h-11 px-3.5 py-2 rounded-lg"
                  )}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5 shrink-0" />
                  ) : (
                    <>
                      <PanelLeftClose className="h-5 w-5 shrink-0" />
                      <span className="truncate text-sm font-medium">Recolher menu</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="font-medium text-xs">
                  Expandir menu
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}

        <ThemeToggle isCollapsed={collapsed} />
      </div>
    </aside>
  );
}
