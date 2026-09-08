import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/shared/layouts/sidebar";
import { Header } from "@/shared/layouts/header";

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState !== null) {
      return savedState === "collapsed";
    }
    const legacyCollapsed = localStorage.getItem("sidebar:collapsed");
    if (legacyCollapsed !== null) return legacyCollapsed === "true";
    return false;
  });

  function handleToggleSidebar() {
    setIsCollapsed((prev) => {
      const next = !prev;
      const stateString = next ? "collapsed" : "expanded";
      localStorage.setItem("sidebar-state", stateString);
      localStorage.setItem("sidebar:collapsed", String(next));
      localStorage.setItem("sidebar:expanded", String(!next));
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Desktop Fixed Sidebar (256px / 80px) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleSidebar}
        className="hidden md:flex sticky top-0 h-screen shrink-0"
      />

      {/* Main Content Workspace */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
