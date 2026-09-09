import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DealerQuickCreateDialog } from "../dealer-quick-create-dialog";

const mockCreateMutateAsync = vi.fn();

vi.mock("@/modules/dealers/hooks/use-dealer-mutations", () => ({
  useCreateDealer: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/shared/hooks/use-cep-lookup", () => ({
  useCepLookup: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
}));

function renderComponent(props: Partial<React.ComponentProps<typeof DealerQuickCreateDialog>> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <DealerQuickCreateDialog {...defaultProps} {...props} />
      </QueryClientProvider>
    ),
  };
}

describe("DealerQuickCreateDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render quick create dialog title and fields", () => {
    renderComponent({ open: true });

    expect(screen.getByText("Nova Concessionária")).toBeInTheDocument();
    expect(screen.getByLabelText("Razão Social")).toBeInTheDocument();
    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("00000-000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar Concessionária" })).toBeInTheDocument();
  });

  it("should invoke onSuccess and close dialog on valid submission", async () => {
    const createdDealer = {
      id: 99,
      name: "Concessionária Quick",
      cnpj: "11.444.777/0001-61",
      cep: "40000-000",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      totalVehicles: 0,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    mockCreateMutateAsync.mockResolvedValueOnce(createdDealer);

    const onSuccessMock = vi.fn();
    const onOpenChangeMock = vi.fn();

    const { user } = renderComponent({
      open: true,
      onSuccess: onSuccessMock,
      onOpenChange: onOpenChangeMock,
    });

    await user.type(screen.getByLabelText("Razão Social"), "Concessionária Quick");
    await user.type(screen.getByLabelText("CNPJ"), "11444777000161");
    await user.type(screen.getByPlaceholderText("00000-000"), "40000000");

    const submitBtn = screen.getByRole("button", { name: "Salvar Concessionária" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        name: "Concessionária Quick",
        cnpj: "11.444.777/0001-61",
        cep: "40000-000",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        imageUrl: undefined,
      });
      expect(onSuccessMock).toHaveBeenCalledWith(createdDealer);
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });
  });

  it("should keep dialog open and show server error when creation fails", async () => {
    const serverError = {
      response: {
        data: {
          title: "Conflito de dados",
          status: 409,
          detail: "Já existe uma concessionária cadastrada com o CNPJ 11.444.777/0001-61.",
        },
      },
    };
    mockCreateMutateAsync.mockRejectedValueOnce(serverError);

    const onOpenChangeMock = vi.fn();

    const { user } = renderComponent({
      open: true,
      onOpenChange: onOpenChangeMock,
    });

    await user.type(screen.getByLabelText("Razão Social"), "Concessionária Duplicada");
    await user.type(screen.getByLabelText("CNPJ"), "11444777000161");
    await user.type(screen.getByPlaceholderText("00000-000"), "40000000");

    const submitBtn = screen.getByRole("button", { name: "Salvar Concessionária" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onOpenChangeMock).not.toHaveBeenCalledWith(false);
    });
  });
});
