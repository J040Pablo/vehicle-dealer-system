import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardPage } from "../dashboard-page";

const mockUseVehicles = vi.fn();
const mockUseDealers = vi.fn();

vi.mock("@/modules/vehicles/hooks/use-vehicles", () => ({
  useVehicles: () => mockUseVehicles(),
}));

vi.mock("@/modules/dealers/hooks/use-dealers", () => ({
  useDealers: () => mockUseDealers(),
}));

import { MemoryRouter } from "react-router-dom";

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render skeleton while vehicles or dealers queries are loading", () => {
    mockUseVehicles.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    mockUseDealers.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    const { container } = renderComponent();

    expect(screen.queryByText("Total de veículos")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("should render error alert when any query fails", () => {
    mockUseVehicles.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error("Vehicles error") });
    mockUseDealers.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    renderComponent();

    expect(screen.getByText("Erro ao carregar o dashboard")).toBeInTheDocument();
  });

  it("should render empty state when system has zero vehicles and zero dealers", () => {
    mockUseVehicles.mockReturnValue({ data: [], isLoading: false, isError: false });
    mockUseDealers.mockReturnValue({ data: [], isLoading: false, isError: false });

    renderComponent();

    expect(screen.getByText("Sem dados disponíveis")).toBeInTheDocument();
    expect(screen.getByText("Cadastre veículos e concessionárias para visualizar métricas.")).toBeInTheDocument();
  });

  it("should calculate metrics correctly and render stat cards when data is available", () => {
    const mockVehiclesList = [
      { id: 1, fuelType: "FLEX", dealerId: 10 },
      { id: 2, fuelType: "GASOLINA", dealerId: null },
      { id: 3, fuelType: "FLEX", dealerId: undefined },
    ];
    const mockDealersList = [{ id: 10, name: "Concessionária Alfa" }];

    mockUseVehicles.mockReturnValue({ data: mockVehiclesList, isLoading: false, isError: false });
    mockUseDealers.mockReturnValue({ data: mockDealersList, isLoading: false, isError: false });

    renderComponent();

    expect(screen.getByText("Total de veículos")).toBeInTheDocument();
    expect(screen.getByText("Total de concessionárias")).toBeInTheDocument();
    expect(screen.getByText("Veículos sem concessionária")).toBeInTheDocument();
    expect(screen.getByText("Tipos de combustível")).toBeInTheDocument();

    // Values: 3 vehicles, 1 dealer, 2 unassigned vehicles, 2 fuel types
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });
});
