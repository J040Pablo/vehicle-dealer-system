import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VehiclesPage } from "../vehicles-page";

const mockVehiclesData = {
  content: [
    {
      id: 1,
      brand: "Toyota",
      model: "Corolla",
      year: 2023,
      plate: "ABC1D23",
      color: "Prata",
      fuelType: "FLEX",
      dealerId: 1,
      dealerName: "Concessionária Alfa",
    },
  ],
  totalPages: 1,
  totalElements: 1,
  first: true,
  last: true,
};

const mockUseVehiclesPaginated = vi.fn().mockReturnValue({
  data: mockVehiclesData,
  isLoading: false,
  isError: false,
  error: null,
});

vi.mock("@/modules/vehicles/hooks/use-vehicles", () => ({
  useVehiclesPaginated: (...args: any[]) => mockUseVehiclesPaginated(...args),
  useVehicles: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/modules/dealers/hooks/use-dealers", () => ({
  useDealers: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/modules/vehicles/hooks/use-vehicle-mutations", () => ({
  useCreateVehicle: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateVehicle: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteVehicle: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <VehiclesPage />
      </QueryClientProvider>
    ),
  };
}

describe("VehiclesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVehiclesPaginated.mockReturnValue({
      data: mockVehiclesData,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("should render page header, search bar and vehicle table", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Veículos" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar por marca, modelo ou placa...")).toBeInTheDocument();
    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Corolla")).toBeInTheDocument();
  });

  it("should render skeleton when isLoading is true", () => {
    mockUseVehiclesPaginated.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { container } = renderComponent();
    expect(screen.queryByText("Toyota")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("should render alert when query fails with error", () => {
    mockUseVehiclesPaginated.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network error"),
    });

    renderComponent();
    expect(screen.getByText("Erro ao carregar catálogo")).toBeInTheDocument();
  });

  it("should filter search and clear search input when clear button is clicked", async () => {
    const { user } = renderComponent();

    const searchInput = screen.getByPlaceholderText("Buscar por marca, modelo ou placa...");
    await user.type(searchInput, "Toyota");

    expect(searchInput).toHaveValue("Toyota");

    const clearBtn = screen.getByRole("button", { name: "Limpar busca" });
    await user.click(clearBtn);

    expect(searchInput).toHaveValue("");
  });

  it("should open create dialog when Novo veículo button is clicked", async () => {
    const { user } = renderComponent();

    const createBtn = screen.getByRole("button", { name: "Novo veículo" });
    await user.click(createBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should open edit dialog when edit button is clicked in table row", async () => {
    const { user } = renderComponent();

    const editBtn = screen.getByRole("button", { name: "Editar veículo Toyota Corolla" });
    await user.click(editBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Editar veículo")).toBeInTheDocument();
  });

  it("should open delete dialog when delete button is clicked in table row", async () => {
    const { user } = renderComponent();

    const deleteBtn = screen.getByRole("button", { name: "Excluir veículo Toyota Corolla" });
    await user.click(deleteBtn);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Excluir veículo")).toBeInTheDocument();
  });
});
