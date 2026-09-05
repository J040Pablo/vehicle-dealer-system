import { NavLink, useLocation } from "react-router-dom";
import { Building2, Car, LayoutDashboard } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/veiculos": "Veículos",
  "/concessionarias": "Concessionárias",
};

const MOBILE_NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/veiculos", label: "Veículos", icon: Car, end: false },
  { to: "/concessionarias", label: "Concessionárias", icon: Building2, end: false },
] as const;

export function Header() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Vehicle Dealer";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <h2 className="text-sm font-medium text-foreground md:hidden">{title}</h2>
      <h2 className="hidden text-sm font-medium text-muted-foreground md:block">{title}</h2>

      <nav className="ml-auto flex items-center gap-1 md:hidden">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )
            }
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
