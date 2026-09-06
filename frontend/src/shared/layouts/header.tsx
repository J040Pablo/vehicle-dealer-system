import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronRight, LogOut } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { Sidebar } from "@/shared/layouts/sidebar";

interface RouteConfig {
  section: string;
  title: string;
}

const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  "/": { section: "Visão Geral", title: "Dashboard" },
  "/veiculos": { section: "Catálogo", title: "Veículos" },
  "/concessionarias": { section: "Parceiros", title: "Concessionárias" },
};

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeConfig = ROUTE_CONFIGS[pathname] ?? { section: "Sistema", title: "Vehicle Dealer" };
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu de navegação"
                className="h-9 w-9 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 w-[240px] bg-background">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>
              <Sidebar
                isMobileDrawer
                onNavigate={() => setMobileOpen(false)}
                className="w-full h-full border-r-0"
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Clean Breadcrumb Trail & Page Title */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground text-sm tracking-tight">{routeConfig.title}</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-muted-foreground/80 font-medium">{routeConfig.section}</span>
        </div>
      </div>

      {/* Logout Action Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </Button>
    </header>
  );
}
