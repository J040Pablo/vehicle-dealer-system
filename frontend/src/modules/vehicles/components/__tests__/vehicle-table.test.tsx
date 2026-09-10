import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { VehicleTable } from "../vehicle-table";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

const mockVehicles: Vehicle[] = [
  {
    id: 1,
    brand: "Toyota",
    model: "Corolla",
    year: 2023,
    plate: "ABC1D23",
    color: "Prata",
    fuelType: "FLEX",
    imageUrl: "https://example.com/corolla.jpg",
    dealerId: 1,
    dealerName: "Concessionária Alfa",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    brand: "Volvo",
    model: "EX30",
    year: 2024,
    plate: "EV9X99",
    color: "Branco",
    fuelType: "ELETRICO",
    imageUrl: null,
    dealerId: null,
    dealerName: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("VehicleTable", () => {
  const defaultProps = {
    vehicles: mockVehicles,
    isLoading: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
    onClearFilter: vi.fn(),
  };

  it("should render skeleton when isLoading is true", () => {
    const { container } = render(
      <MemoryRouter>
        <VehicleTable {...defaultProps} isLoading={true} />
      </MemoryRouter>
    );
    expect(screen.queryByText("Toyota")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("should render empty state when vehicles list is empty and not filtered", async () => {
    const user = userEvent.setup();
    const onCreateMock = vi.fn();

    render(
      <MemoryRouter>
        <VehicleTable {...defaultProps} vehicles={[]} isFiltered={false} onCreate={onCreateMock} />
      </MemoryRouter>
    );

    expect(screen.getByText("Nenhum veículo encontrado")).toBeInTheDocument();
    expect(screen.getByText("Cadastre o primeiro veículo para começar.")).toBeInTheDocument();

    const createBtn = screen.getByRole("button", { name: "Cadastrar veículo" });
    await user.click(createBtn);
    expect(onCreateMock).toHaveBeenCalledTimes(1);
  });

  it("should render empty state when vehicles list is empty and filtered", async () => {
    const user = userEvent.setup();
    const onClearFilterMock = vi.fn();

    render(
      <MemoryRouter>
        <VehicleTable
          {...defaultProps}
          vehicles={[]}
          isFiltered={true}
          onClearFilter={onClearFilterMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Nenhum veículo encontrado")).toBeInTheDocument();
    expect(screen.getByText("Nenhum veículo corresponde aos termos buscados.")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: "Limpar busca" });
    await user.click(clearBtn);
    expect(onClearFilterMock).toHaveBeenCalledTimes(1);
  });

  it("should render vehicles list with badges and dealer link", () => {
    render(
      <MemoryRouter>
        <VehicleTable {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Corolla")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("ABC1D23")).toBeInTheDocument();
    expect(screen.getByText("Flex")).toBeInTheDocument();
    expect(screen.getByText("Concessionária Alfa")).toBeInTheDocument();

    expect(screen.getByText("Volvo")).toBeInTheDocument();
    expect(screen.getByText("EX30")).toBeInTheDocument();
    expect(screen.getByText("Elétrico")).toBeInTheDocument();
    expect(screen.getByText("Sem concessionária")).toBeInTheDocument();
  });

  it("should render vehicle thumbnail with object-contain styling", () => {
    render(
      <MemoryRouter>
        <VehicleTable {...defaultProps} />
      </MemoryRouter>
    );

    const img = screen.getByAltText("Toyota Corolla");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/corolla.jpg");
    expect(img).toHaveClass("object-contain");
  });

  it("should trigger onSelectDealer when dealer link is clicked", async () => {
    const user = userEvent.setup();
    const onSelectDealerMock = vi.fn();

    render(
      <MemoryRouter>
        <VehicleTable {...defaultProps} onSelectDealer={onSelectDealerMock} />
      </MemoryRouter>
    );

    const dealerLink = screen.getByRole("link", { name: "Concessionária Alfa" });
    await user.click(dealerLink);

    expect(onSelectDealerMock).toHaveBeenCalledWith(1);
  });

  it("should trigger view, edit and delete action callbacks when buttons are clicked", async () => {
    const user = userEvent.setup();
    const onViewMock = vi.fn();
    const onEditMock = vi.fn();
    const onDeleteMock = vi.fn();

    render(
      <MemoryRouter>
        <VehicleTable {...defaultProps} onView={onViewMock} onEdit={onEditMock} onDelete={onDeleteMock} />
      </MemoryRouter>
    );

    const viewBtn = screen.getByRole("button", { name: "Visualizar detalhes do veículo Toyota Corolla" });
    const editBtn = screen.getByRole("button", { name: "Editar veículo Toyota Corolla" });
    const deleteBtn = screen.getByRole("button", { name: "Excluir veículo Toyota Corolla" });

    await user.click(viewBtn);
    expect(onViewMock).toHaveBeenCalledWith(mockVehicles[0]);

    await user.click(editBtn);
    expect(onEditMock).toHaveBeenCalledWith(mockVehicles[0]);

    await user.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalledWith(mockVehicles[0]);
  });
});
