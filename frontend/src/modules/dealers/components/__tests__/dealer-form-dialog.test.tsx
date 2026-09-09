import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DealerFormDialog } from "../dealer-form-dialog";
import type { Dealer } from "@/modules/dealers/types/dealer";

// Mock mutations and cep hooks
const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

vi.mock("@/modules/dealers/hooks/use-dealer-mutations", () => ({
  useCreateDealer: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateDealer: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
}));

const mockUseCepLookup = vi.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  isSuccess: false,
});

vi.mock("@/shared/hooks/use-cep-lookup", () => ({
  useCepLookup: (cep: string) => mockUseCepLookup(cep),
}));

function renderComponent(props: Partial<React.ComponentProps<typeof DealerFormDialog>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    dealer: null,
  };

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <DealerFormDialog {...defaultProps} {...props} />
      </QueryClientProvider>
    ),
  };
}

describe("DealerFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly in creation mode", () => {
    renderComponent({ open: true, dealer: null });

    expect(screen.getByText("Nova concessionária")).toBeInTheDocument();
    expect(screen.getByLabelText("Razão Social")).toBeInTheDocument();
    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("00000-000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("should render correctly in edit mode with pre-filled fields", () => {
    const existingDealer: Dealer = {
      id: 1,
      name: "Concessionária Teste",
      cnpj: "11.444.777/0001-61",
      cep: "40000-000",
      street: "Rua Principal",
      neighborhood: "Centro",
      city: "Salvador",
      state: "BA",
      totalVehicles: 5,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    renderComponent({ open: true, dealer: existingDealer });

    expect(screen.getByText("Editar concessionária")).toBeInTheDocument();
    expect(screen.getByLabelText("Razão Social")).toHaveValue("Concessionária Teste");
    expect(screen.getByLabelText("CNPJ")).toHaveValue("11.444.777/0001-61");
    expect(screen.getByPlaceholderText("00000-000")).toHaveValue("40000-000");
  });

  it("should show validation errors when submitting empty form", async () => {
    const { user } = renderComponent({ open: true, dealer: null });

    const submitBtn = screen.getByRole("button", { name: "Salvar" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("A Razão Social / Nome da concessionária é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("O CNPJ é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("O CEP é obrigatório.")).toBeInTheDocument();
    });

    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("should submit successfully in create mode when fields are valid", async () => {
    mockCreateMutateAsync.mockResolvedValueOnce({ id: 2 });
    const onOpenChangeMock = vi.fn();

    const { user } = renderComponent({ open: true, dealer: null, onOpenChange: onOpenChangeMock });

    await user.type(screen.getByLabelText("Razão Social"), "Auto Bahia Ltda");
    await user.type(screen.getByLabelText("CNPJ"), "11444777000161");
    await user.type(screen.getByPlaceholderText("00000-000"), "40000000");

    const submitBtn = screen.getByRole("button", { name: "Salvar" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        name: "Auto Bahia Ltda",
        cnpj: "11.444.777/0001-61",
        cep: "40000-000",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        imageUrl: undefined,
      });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });

  it("should submit successfully in edit mode", async () => {
    mockUpdateMutateAsync.mockResolvedValueOnce({ id: 1 });
    const onOpenChangeMock = vi.fn();

    const existingDealer: Dealer = {
      id: 1,
      name: "Concessionária Antiga",
      cnpj: "11.444.777/0001-61",
      cep: "40000-000",
      street: "Rua A",
      neighborhood: "Bairro B",
      city: "Cidade C",
      state: "BA",
      totalVehicles: 2,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    const { user } = renderComponent({
      open: true,
      dealer: existingDealer,
      onOpenChange: onOpenChangeMock,
    });

    const nameInput = screen.getByLabelText("Razão Social");
    await user.clear(nameInput);
    await user.type(nameInput, "Concessionária Atualizada");

    const submitBtn = screen.getByRole("button", { name: "Salvar" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: 1,
        input: {
          name: "Concessionária Atualizada",
          cnpj: "11.444.777/0001-61",
          cep: "40000-000",
          street: "Rua A",
          neighborhood: "Bairro B",
          city: "Cidade C",
          state: "BA",
          imageUrl: undefined,
        },
      });
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });
});
