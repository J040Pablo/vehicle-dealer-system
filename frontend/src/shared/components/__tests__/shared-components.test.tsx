import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";

import { ConfirmDeleteDialog } from "../confirm-delete-dialog";
import { PaginationControls } from "../pagination-controls";
import { ThemeToggle } from "../theme-toggle";
import { EmptyState } from "../empty-state";
import { PageHeader } from "../page-header";
import { Car } from "lucide-react";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

describe("Shared Components", () => {
  describe("ConfirmDeleteDialog", () => {
    it("should render title and description when open is true", () => {
      render(
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Excluir Concessionária"
          description="Tem certeza que deseja excluir esta concessionária?"
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText("Excluir Concessionária")).toBeInTheDocument();
      expect(screen.getByText("Tem certeza que deseja excluir esta concessionária?")).toBeInTheDocument();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
      const user = userEvent.setup();
      const handleConfirm = vi.fn();

      render(
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Excluir Veículo"
          description="Confirmar exclusão"
          onConfirm={handleConfirm}
        />
      );

      await user.click(screen.getByRole("button", { name: "Excluir" }));
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it("should show pending label and disable buttons when isPending is true", () => {
      render(
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Excluir Veículo"
          description="Confirmar exclusão"
          isPending={true}
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText("Excluindo...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
    });
  });

  describe("PaginationControls", () => {
    it("should render page count and element count", () => {
      render(
        <PaginationControls
          page={0}
          totalPages={5}
          totalElements={50}
          size={10}
          onPageChange={vi.fn()}
          onSizeChange={vi.fn()}
        />
      );

      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should disable previous buttons on first page and enable next buttons", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();

      render(
        <PaginationControls
          page={0}
          totalPages={3}
          totalElements={30}
          size={10}
          onPageChange={handlePageChange}
          onSizeChange={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: "Primeira página" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();

      const nextBtn = screen.getByRole("button", { name: "Próxima página" });
      expect(nextBtn).toBeEnabled();
      await user.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(1);

      const lastBtn = screen.getByRole("button", { name: "Última página" });
      await user.click(lastBtn);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it("should handle previous and first page clicks when on last page", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();

      render(
        <PaginationControls
          page={2}
          totalPages={3}
          totalElements={30}
          size={10}
          onPageChange={handlePageChange}
          onSizeChange={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Última página" })).toBeDisabled();

      const prevBtn = screen.getByRole("button", { name: "Página anterior" });
      await user.click(prevBtn);
      expect(handlePageChange).toHaveBeenCalledWith(1);

      const firstBtn = screen.getByRole("button", { name: "Primeira página" });
      await user.click(firstBtn);
      expect(handlePageChange).toHaveBeenCalledWith(0);
    });
  });

  describe("ThemeToggle", () => {
    it("should render dark theme label when theme is dark", () => {
      vi.mocked(useTheme).mockReturnValue({
        theme: "dark",
        setTheme: vi.fn(),
        themes: ["light", "dark", "system"],
        systemTheme: "dark",
      });

      render(<ThemeToggle />);
      expect(screen.getByText("Tema Escuro")).toBeInTheDocument();
    });

    it("should render light theme label when theme is light", () => {
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: vi.fn(),
        themes: ["light", "dark", "system"],
        systemTheme: "light",
      });

      render(<ThemeToggle />);
      expect(screen.getByText("Tema Claro")).toBeInTheDocument();
    });

    it("should render system theme label when theme is system", () => {
      vi.mocked(useTheme).mockReturnValue({
        theme: "system",
        setTheme: vi.fn(),
        themes: ["light", "dark", "system"],
        systemTheme: "dark",
      });

      render(<ThemeToggle />);
      expect(screen.getByText("Tema do Sistema")).toBeInTheDocument();
    });

    it("should toggle menu and call setTheme when item clicked", async () => {
      const mockSetTheme = vi.fn();
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
      });

      const user = userEvent.setup();
      render(<ThemeToggle />);

      await user.click(screen.getByRole("button", { name: "Alternar tema de cores" }));
      expect(screen.getByText("Claro")).toBeInTheDocument();
      expect(screen.getByText("Escuro")).toBeInTheDocument();
      expect(screen.getByText("Sistema")).toBeInTheDocument();

      await user.click(screen.getByText("Escuro"));
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("should render collapsed trigger button with tooltip container", () => {
      vi.mocked(useTheme).mockReturnValue({
        theme: "dark",
        setTheme: vi.fn(),
        themes: ["light", "dark", "system"],
        systemTheme: "dark",
      });

      render(<ThemeToggle isCollapsed={true} />);
      expect(screen.getByRole("button", { name: "Alternar tema de cores" })).toBeInTheDocument();
    });
  });

  describe("EmptyState & PageHeader", () => {
    it("should render EmptyState with title, description, and action button", async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(
        <EmptyState
          icon={Car}
          title="Sem veículos"
          description="Nenhum veículo encontrado"
          actionLabel="Adicionar"
          onAction={handleAction}
        />
      );

      expect(screen.getByText("Sem veículos")).toBeInTheDocument();
      expect(screen.getByText("Nenhum veículo encontrado")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Adicionar" }));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it("should render PageHeader title, description and action element", () => {
      render(
        <PageHeader
          title="Concessionárias"
          description="Gestão de concessionárias"
          action={<button>Nova Concessionária</button>}
        />
      );

      expect(screen.getByText("Concessionárias")).toBeInTheDocument();
      expect(screen.getByText("Gestão de concessionárias")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Nova Concessionária" })).toBeInTheDocument();
    });
  });
});
