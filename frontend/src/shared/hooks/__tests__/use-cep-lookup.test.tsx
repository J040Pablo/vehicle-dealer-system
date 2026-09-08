import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCepLookup } from "../use-cep-lookup";
import { cepApi } from "@/shared/api/cep-api";

vi.mock("@/shared/api/cep-api", () => ({
  cepApi: {
    getAddressByCep: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useCepLookup Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not execute query if CEP is invalid or has less than 8 numeric digits", () => {
    const { result } = renderHook(() => useCepLookup("123-45"), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe("idle");
    expect(cepApi.getAddressByCep).not.toHaveBeenCalled();
  });

  it("should handle empty or undefined CEP string without throwing errors", () => {
    const { result } = renderHook(() => useCepLookup(undefined as unknown as string), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe("idle");
    expect(cepApi.getAddressByCep).not.toHaveBeenCalled();
  });

  it("should fetch address details when CEP is valid 8 numeric digits", async () => {
    const mockAddress = {
      cep: "40000-000",
      street: "Avenida Sete de Setembro",
      neighborhood: "Centro",
      city: "Salvador",
      state: "BA",
    };
    vi.mocked(cepApi.getAddressByCep).mockResolvedValueOnce(mockAddress);

    const { result } = renderHook(() => useCepLookup("40000-000"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cepApi.getAddressByCep).toHaveBeenCalledWith("40000000");
    expect(result.current.data).toEqual(mockAddress);
  });

  it("should handle error state when getAddressByCep fails", async () => {
    vi.mocked(cepApi.getAddressByCep).mockRejectedValue(new Error("CEP não encontrado."));

    const { result } = renderHook(() => useCepLookup("99999-999"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("CEP não encontrado.");
  });
});
