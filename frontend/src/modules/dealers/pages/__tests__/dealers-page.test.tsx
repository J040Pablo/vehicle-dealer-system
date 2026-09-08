import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DealersPage } from "../dealers-page";

const mockDealersData = {
  content: [
    {
      id: 1,
      name: "Concessionária Alfa",
      cnpj: "11.444.777/0001-61",
      cep: "40000-000",
      street: "Rua A",
      neighborhood: "Bairro B",
      city: "Salvador",
      state: "BA",
      totalVehicles: 3,
    },
  ],
  totalPages: 1,
  totalElements: 1,
  first: true,
  last: true,
};

const mockUseDealersPaginated = vi.fn().mockReturnValue({
  data: mockDealersData,
  isLoading: false,
  isError: false,
  error: null,
});

vi.mock("@/modules/dealers/hooks/use-dealers", () => ({
  useDealersPaginated: (...args: any[]) => mockUseDealersPaginated(...args),
  useDealers: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/shared/hooks/use-cep-lookup", () => ({
  useCepLookup: () => ({ data: undefined, isLoading: false }),
}));

vi.mock("@/modules/dealers/hooks/use-dealer-mutations", () => ({
  useCreateDealer: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDealer: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDealer: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <DealersPage />
      </QueryClientProvider>
    ),
  };
}

describe("DealersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDealersPaginated.mockReturnValue({
      data: mockDealersData,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("should render page header, search input and dealer table", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Concessionárias" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar por razão social, CNPJ ou cidade...")).toBeInTheDocument();
    expect(screen.getByText("Concessionária Alfa")).toBeInTheDocument();
  });

  it("should render skeleton when isLoading is true", () => {
    mockUseDealersPaginated.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { container } = renderComponent();
    expect(screen.queryByText("Concessionária Alfa")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("should render error alert when query fails", () => {
    mockUseDealersPaginated.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network failure"),
    });

    renderComponent();
    expect(screen.getByText("Erro ao carregar concessionárias")).toBeInTheDocument();
  });

  it("should filter dealers list by search term", async () => {
    const { user } = renderComponent();

    const searchInput = screen.getByPlaceholderText("Buscar por razão social, CNPJ ou cidade...");
    await user.type(searchInput, "Salvador");

    expect(searchInput).toHaveValue("Salvador");

    const clearBtn = screen.getByRole("button", { name: "Limpar busca" });
    await user.click(clearBtn);

    expect(searchInput).toHaveValue("");
  });

  it("should open creation form dialog when Nova concessionária button is clicked", async () => {
    const { user } = renderComponent();

    const createBtn = screen.getByRole("button", { name: "Nova concessionária" });
    await user.click(createBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should open edit form dialog when edit button is clicked in row", async () => {
    const { user } = renderComponent();

    const editBtn = screen.getByRole("button", { name: "Editar concessionária Concessionária Alfa" });
    await user.click(editBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Editar concessionária")).toBeInTheDocument();
  });

  it("should open delete dialog when delete button is clicked in row", async () => {
    const { user } = renderComponent();

    const deleteBtn = screen.getByRole("button", { name: "Excluir concessionária Concessionária Alfa" });
    await user.click(deleteBtn);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Excluir concessionária")).toBeInTheDocument();
  });

  it("should open vehicles dialog when viewing vehicles count button is clicked", async () => {
    const { user } = renderComponent();

    const viewVehiclesBtn = screen.getByRole("button", { name: "Ver veículos vinculados da concessionária Concessionária Alfa" });
    await user.click(viewVehiclesBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
