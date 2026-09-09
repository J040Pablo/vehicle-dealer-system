import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VehicleFormDialog } from "../vehicle-form-dialog";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

// Mock mutations and dealers query hook
const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

vi.mock("@/modules/vehicles/hooks/use-vehicle-mutations", () => ({
  useCreateVehicle: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateVehicle: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
}));

const mockDealers = [
  { id: 1, name: "Concessionária Alfa", cnpj: "11.444.777/0001-61", cep: "40000-000", totalVehicles: 3 },
  { id: 2, name: "Concessionária Beta", cnpj: "00.000.000/0001-91", cep: "40000-100", totalVehicles: 1 },
];

vi.mock("@/modules/dealers/hooks/use-dealers", () => ({
  useDealers: () => ({
    data: mockDealers,
    isLoading: false,
  }),
}));

function renderComponent(props: Partial<React.ComponentProps<typeof VehicleFormDialog>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    vehicle: null,
  };

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <VehicleFormDialog {...defaultProps} {...props} />
      </QueryClientProvider>
    ),
  };
}

describe("VehicleFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly in creation mode", () => {
    renderComponent({ open: true, vehicle: null });

    expect(screen.getByText("Novo veículo")).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toBeInTheDocument();
    expect(screen.getByLabelText("Modelo")).toBeInTheDocument();
    expect(screen.getByLabelText("Ano")).toBeInTheDocument();
    expect(screen.getByLabelText("Placa")).toBeInTheDocument();
    expect(screen.getByLabelText("Cor")).toBeInTheDocument();
    expect(screen.getByLabelText("Combustível")).toBeInTheDocument();
    expect(screen.getByLabelText("Concessionária")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("should render correctly in edit mode with pre-filled vehicle data", () => {
    const existingVehicle: Vehicle = {
      id: 10,
      brand: "Toyota",
      model: "Corolla",
      year: 2023,
      plate: "ABC1D23",
      color: "Prata",
      fuelType: "FLEX",
      dealerId: 1,
      dealerName: "Concessionária Alfa",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    renderComponent({ open: true, vehicle: existingVehicle });

    expect(screen.getByText("Editar veículo")).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("Toyota");
    expect(screen.getByLabelText("Modelo")).toHaveValue("Corolla");
    expect(screen.getByLabelText("Ano")).toHaveValue(2023);
    expect(screen.getByLabelText("Placa")).toHaveValue("ABC1D23");
    expect(screen.getByLabelText("Cor")).toHaveValue("Prata");
  });

  it("should show validation errors when submitting required empty fields", async () => {
    const { user } = renderComponent({ open: true, vehicle: null });

    // Clear default year if needed or clear text fields
    const brandInput = screen.getByLabelText("Marca");
    const modelInput = screen.getByLabelText("Modelo");
    const plateInput = screen.getByLabelText("Placa");
    const colorInput = screen.getByLabelText("Cor");

    await user.clear(brandInput);
    await user.clear(modelInput);
    await user.clear(plateInput);
    await user.clear(colorInput);

    const submitBtn = screen.getByRole("button", { name: "Salvar" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("A marca do veículo é obrigatória.")).toBeInTheDocument();
      expect(screen.getByText("O modelo do veículo é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("A placa do veículo é obrigatória.")).toBeInTheDocument();
      expect(screen.getByText("A cor do veículo é obrigatória.")).toBeInTheDocument();
    });

    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("should submit successfully in creation mode", async () => {
    mockCreateMutateAsync.mockResolvedValueOnce({ id: 100 });
    const onOpenChangeMock = vi.fn();

    const { user } = renderComponent({ open: true, vehicle: null, onOpenChange: onOpenChangeMock });

    await user.type(screen.getByLabelText("Marca"), "Honda");
    await user.type(screen.getByLabelText("Modelo"), "Civic");
    await user.type(screen.getByLabelText("Placa"), "xyz9876");
    await user.type(screen.getByLabelText("Cor"), "Preto");

    const submitBtn = screen.getByRole("button", { name: "Salvar" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: "Honda",
          model: "Civic",
          year: expect.any(Number),
          plate: "XYZ9876",
          color: "Preto",
          fuelType: "FLEX",
        })
      );
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });

  it("should submit successfully in edit mode", async () => {
    mockUpdateMutateAsync.mockResolvedValueOnce({ id: 10 });
    const onOpenChangeMock = vi.fn();

    const existingVehicle: Vehicle = {
      id: 10,
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      plate: "ABC1D23",
      color: "Prata",
      fuelType: "GASOLINA",
      dealerId: 1,
      dealerName: "Concessionária Alfa",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    const { user } = renderComponent({
      open: true,
      vehicle: existingVehicle,
      onOpenChange: onOpenChangeMock,
    });

    const modelInput = screen.getByLabelText("Modelo");
    await user.clear(modelInput);
    await user.type(modelInput, "Corolla Cross");

    const submitBtn = screen.getByRole("button", { name: "Salvar" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: 10,
        input: expect.objectContaining({
          brand: "Toyota",
          model: "Corolla Cross",
          year: 2022,
          plate: "ABC1D23",
          color: "Prata",
          fuelType: "GASOLINA",
          dealerId: 1,
        }),
      });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });
});
