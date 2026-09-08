import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "../sidebar";
import { Header } from "../header";
import { AppLayout } from "../app-layout";

const mockLogout = vi.fn();
vi.mock("@/modules/auth/context/auth-context", () => ({
  useAuth: () => ({
    user: { username: "admin", role: "ADMIN" },
    logout: mockLogout,
  }),
}));

describe("Layout Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Sidebar", () => {
    it("should render expanded sidebar with navigation links", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar isCollapsed={false} />
        </MemoryRouter>
      );

      expect(screen.getByText("Vehicle Dealer")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Veículos")).toBeInTheDocument();
      expect(screen.getByText("Concessionárias")).toBeInTheDocument();
    });

    it("should render collapsed sidebar without textual labels", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar isCollapsed={true} />
        </MemoryRouter>
      );

      expect(screen.queryByText("Vehicle Management System")).not.toBeInTheDocument();
    });

    it("should trigger onToggleCollapse when collapse button is clicked", async () => {
      const user = userEvent.setup();
      const onToggleCollapseMock = vi.fn();

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar isCollapsed={false} onToggleCollapse={onToggleCollapseMock} />
        </MemoryRouter>
      );

      const toggleBtn = screen.getByRole("button", { name: "Recolher menu" });
      await user.click(toggleBtn);

      expect(onToggleCollapseMock).toHaveBeenCalledTimes(1);
    });

    it("should render mobile drawer and call onNavigate when link is clicked", async () => {
      const user = userEvent.setup();
      const onNavigateMock = vi.fn();

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar isMobileDrawer={true} onNavigate={onNavigateMock} />
        </MemoryRouter>
      );

      const navLink = screen.getByRole("link", { name: "Veículos" });
      await user.click(navLink);

      expect(onNavigateMock).toHaveBeenCalledTimes(1);
    });

    it("should render expand menu button when collapsed and trigger toggle", async () => {
      const user = userEvent.setup();
      const onToggleCollapseMock = vi.fn();

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar isCollapsed={true} onToggleCollapse={onToggleCollapseMock} />
        </MemoryRouter>
      );

      const expandBtn = screen.getByRole("button", { name: "Expandir menu" });
      await user.click(expandBtn);

      expect(onToggleCollapseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Header", () => {
    it("should render current section title based on route", () => {
      render(
        <MemoryRouter initialEntries={["/veiculos"]}>
          <Header />
        </MemoryRouter>
      );

      expect(screen.getByText("Veículos")).toBeInTheDocument();
      expect(screen.getByText("Catálogo")).toBeInTheDocument();
    });

    it("should trigger logout on logout button click", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Header />
        </MemoryRouter>
      );

      const logoutBtn = screen.getByRole("button", { name: "Sair" });
      await user.click(logoutBtn);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("AppLayout", () => {
    it("should render full app layout with sidebar, header and child outlet", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<div>Dashboard Child Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Dashboard Child Page")).toBeInTheDocument();
    });

    it("should initialize collapsed state from legacy localStorage key", () => {
      localStorage.setItem("sidebar:collapsed", "true");

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should toggle sidebar collapse state and update localStorage when clicked", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const toggleBtn = screen.getByRole("button", { name: "Recolher menu" });
      await user.click(toggleBtn);

      expect(localStorage.getItem("sidebar-state")).toBe("collapsed");
    });
  });
});
