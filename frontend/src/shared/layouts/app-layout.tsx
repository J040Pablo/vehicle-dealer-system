import { Outlet } from "react-router-dom";

import { Sidebar } from "@/shared/layouts/sidebar";
import { Header } from "@/shared/layouts/header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden md:flex" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
