import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DealerTable } from "../dealer-table";
import type { Dealer } from "@/modules/dealers/types/dealer";

const mockDealers: Dealer[] = [
  {
    id: 1,
    name: "Concessionária Alfa",
    cnpj: "11.444.777/0001-61",
    cep: "40000-000",
    street: "Rua A",
    neighborhood: "Bairro A",
    city: "Salvador",
    state: "BA",
    totalVehicles: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Concessionária Beta",
    cnpj: "00.000.000/0001-91",
    cep: "01000-000",
    street: "Rua B",
    neighborhood: "Bairro B",
    city: "São Paulo",
    state: "SP",
    totalVehicles: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("DealerTable", () => {
  const defaultProps = {
    dealers: mockDealers,
    isLoading: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewVehicles: vi.fn(),
    onCreate: vi.fn(),
    onClearFilter: vi.fn(),
  };

  it("should render skeleton when isLoading is true", () => {
    const { container } = render(<DealerTable {...defaultProps} isLoading={true} />);
    expect(screen.queryByText("Concessionária Alfa")).not.toBeInTheDocument();
    // Skeleton elements should be present
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("should render empty state when dealers array is empty and not filtered", async () => {
    const user = userEvent.setup();
    const onCreateMock = vi.fn();

    render(<DealerTable {...defaultProps} dealers={[]} isFiltered={false} onCreate={onCreateMock} />);

    expect(screen.getByText("Nenhuma concessionária encontrada")).toBeInTheDocument();
    expect(screen.getByText("Cadastre sua primeira concessionária.")).toBeInTheDocument();

    const createBtn = screen.getByRole("button", { name: "Cadastrar concessionária" });
    await user.click(createBtn);
    expect(onCreateMock).toHaveBeenCalledTimes(1);
  });

  it("should render empty state when dealers array is empty and filtered", async () => {
    const user = userEvent.setup();
    const onClearFilterMock = vi.fn();

    render(
      <DealerTable
        {...defaultProps}
        dealers={[]}
        isFiltered={true}
        onClearFilter={onClearFilterMock}
      />
    );

    expect(screen.getByText("Nenhuma concessionária encontrada")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma concessionária atende aos termos buscados.")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: "Limpar busca" });
    await user.click(clearBtn);
    expect(onClearFilterMock).toHaveBeenCalledTimes(1);
  });

  it("should render dealers list with correct columns and data", () => {
    render(<DealerTable {...defaultProps} />);

    expect(screen.getByText("Concessionária Alfa")).toBeInTheDocument();
    expect(screen.getByText("11.444.777/0001-61")).toBeInTheDocument();
    expect(screen.getByText("Salvador")).toBeInTheDocument();
    expect(screen.getByText("BA")).toBeInTheDocument();
    expect(screen.getByText("3 veículos")).toBeInTheDocument();

    expect(screen.getByText("Concessionária Beta")).toBeInTheDocument();
    expect(screen.getByText("00.000.000/0001-91")).toBeInTheDocument();
    expect(screen.getByText("1 veículo")).toBeInTheDocument();
  });

  it("should trigger view, edit and delete actions when buttons are clicked", async () => {
    const user = userEvent.setup();
    const onViewVehiclesMock = vi.fn();
    const onEditMock = vi.fn();
    const onDeleteMock = vi.fn();

    render(
      <DealerTable
        {...defaultProps}
        onViewVehicles={onViewVehiclesMock}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    );

    const viewBtn = screen.getByRole("button", {
      name: "Ver veículos vinculados da concessionária Concessionária Alfa",
    });
    const editBtn = screen.getByRole("button", {
      name: "Editar concessionária Concessionária Alfa",
    });
    const deleteBtn = screen.getByRole("button", {
      name: "Excluir concessionária Concessionária Alfa",
    });

    await user.click(viewBtn);
    expect(onViewVehiclesMock).toHaveBeenCalledWith(mockDealers[0]);

    await user.click(editBtn);
    expect(onEditMock).toHaveBeenCalledWith(mockDealers[0]);

    await user.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalledWith(mockDealers[0]);
  });
});
