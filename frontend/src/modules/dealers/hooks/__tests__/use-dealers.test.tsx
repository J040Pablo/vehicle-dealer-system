import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDealersPaginated, useDealers } from "../use-dealers";
import { useCreateDealer, useUpdateDealer, useDeleteDealer } from "../use-dealer-mutations";
import { dealerApi } from "@/modules/dealers/api/dealer-api";

vi.mock("@/modules/dealers/api/dealer-api", () => ({
  dealerApi: {
    list: vi.fn(),
    listAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@/shared/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("Dealer Hooks & Mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Queries", () => {
    it("should fetch paginated dealers using useDealersPaginated", async () => {
      const mockPageResponse = {
        content: [{ id: 1, name: "Concessionária Alfa", cnpj: "11.444.777/0001-61" }],
        totalElements: 1,
        totalPages: 1,
      };
      vi.mocked(dealerApi.list).mockResolvedValueOnce(mockPageResponse as any);

      const { result } = renderHook(() => useDealersPaginated(0, 10), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(dealerApi.list).toHaveBeenCalledWith({ page: 0, size: 10 });
      expect(result.current.data).toEqual(mockPageResponse);
    });

    it("should fetch all dealers using useDealers", async () => {
      const mockDealers = [{ id: 1, name: "Concessionária Alfa" }];
      vi.mocked(dealerApi.listAll).mockResolvedValueOnce(mockDealers as any);

      const { result } = renderHook(() => useDealers(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(dealerApi.listAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockDealers);
    });
  });

  describe("Mutations", () => {
    it("should handle create dealer mutation success and error", async () => {
      vi.mocked(dealerApi.create).mockResolvedValueOnce({ id: 1 } as any);

      const { result } = renderHook(() => useCreateDealer(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          name: "Auto Bahia",
          cnpj: "11.444.777/0001-61",
          cep: "40000-000",
          street: "Rua A",
          neighborhood: "Bairro B",
          city: "Salvador",
          state: "BA",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(dealerApi.create).toHaveBeenCalled();
    });

    it("should handle create dealer mutation error", async () => {
      vi.mocked(dealerApi.create).mockRejectedValueOnce(new Error("Creation error"));

      const { result } = renderHook(() => useCreateDealer(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          name: "Auto Bahia",
          cnpj: "11.444.777/0001-61",
          cep: "40000-000",
          street: "Rua A",
          neighborhood: "Bairro B",
          city: "Salvador",
          state: "BA",
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should handle update dealer mutation success and error", async () => {
      vi.mocked(dealerApi.update).mockResolvedValueOnce({ id: 1 } as any);

      const { result } = renderHook(() => useUpdateDealer(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          id: 1,
          input: {
            name: "Auto Bahia Ltda",
            cnpj: "11.444.777/0001-61",
            cep: "40000-000",
            street: "Rua A",
            neighborhood: "Bairro B",
            city: "Salvador",
            state: "BA",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(dealerApi.update).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it("should handle update dealer mutation error", async () => {
      vi.mocked(dealerApi.update).mockRejectedValueOnce(new Error("Update error"));

      const { result } = renderHook(() => useUpdateDealer(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          id: 1,
          input: {
            name: "Auto Bahia Ltda",
            cnpj: "11.444.777/0001-61",
            cep: "40000-000",
            street: "Rua A",
            neighborhood: "Bairro B",
            city: "Salvador",
            state: "BA",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should handle delete dealer mutation success and error", async () => {
      vi.mocked(dealerApi.remove).mockResolvedValueOnce(undefined as any);

      const { result } = renderHook(() => useDeleteDealer(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(dealerApi.remove).toHaveBeenCalledWith(1);
    });

    it("should handle delete dealer mutation error", async () => {
      vi.mocked(dealerApi.remove).mockRejectedValueOnce(new Error("Delete error"));

      const { result } = renderHook(() => useDeleteDealer(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
