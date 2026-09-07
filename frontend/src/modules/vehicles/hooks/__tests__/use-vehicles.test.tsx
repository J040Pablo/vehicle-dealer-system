import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useVehiclesPaginated, useVehicles } from "../use-vehicles";
import { useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "../use-vehicle-mutations";
import { vehicleApi } from "@/modules/vehicles/api/vehicle-api";

vi.mock("@/modules/vehicles/api/vehicle-api", () => ({
  vehicleApi: {
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

describe("Vehicle Hooks & Mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Queries", () => {
    it("should fetch paginated vehicles using useVehiclesPaginated", async () => {
      const mockPageResponse = {
        content: [{ id: 1, brand: "Toyota", model: "Corolla" }],
        totalElements: 1,
        totalPages: 1,
      };
      vi.mocked(vehicleApi.list).mockResolvedValueOnce(mockPageResponse as any);

      const { result } = renderHook(() => useVehiclesPaginated(0, 10, "Toyota", 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vehicleApi.list).toHaveBeenCalledWith({ page: 0, size: 10, search: "Toyota", dealerId: 1 });
      expect(result.current.data).toEqual(mockPageResponse);
    });

    it("should fetch all vehicles using useVehicles", async () => {
      const mockVehicles = [{ id: 1, brand: "Toyota" }];
      vi.mocked(vehicleApi.listAll).mockResolvedValueOnce(mockVehicles as any);

      const { result } = renderHook(() => useVehicles(2), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vehicleApi.listAll).toHaveBeenCalledWith(2);
      expect(result.current.data).toEqual(mockVehicles);
    });
  });

  describe("Mutations", () => {
    it("should handle create vehicle mutation success and error", async () => {
      vi.mocked(vehicleApi.create).mockResolvedValueOnce({ id: 1 } as any);

      const { result } = renderHook(() => useCreateVehicle(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          brand: "Honda",
          model: "Civic",
          year: 2023,
          plate: "ABC1D23",
          color: "Preto",
          fuelType: "FLEX",
          dealerId: null,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vehicleApi.create).toHaveBeenCalled();
    });

    it("should handle create vehicle mutation error", async () => {
      vi.mocked(vehicleApi.create).mockRejectedValueOnce(new Error("Creation error"));

      const { result } = renderHook(() => useCreateVehicle(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          brand: "Honda",
          model: "Civic",
          year: 2023,
          plate: "ABC1D23",
          color: "Preto",
          fuelType: "FLEX",
          dealerId: null,
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should handle update vehicle mutation success and error", async () => {
      vi.mocked(vehicleApi.update).mockResolvedValueOnce({ id: 1 } as any);

      const { result } = renderHook(() => useUpdateVehicle(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          id: 1,
          input: {
            brand: "Honda",
            model: "Civic LX",
            year: 2023,
            plate: "ABC1D23",
            color: "Preto",
            fuelType: "FLEX",
            dealerId: null,
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vehicleApi.update).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it("should handle update vehicle mutation error", async () => {
      vi.mocked(vehicleApi.update).mockRejectedValueOnce(new Error("Update error"));

      const { result } = renderHook(() => useUpdateVehicle(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({
          id: 1,
          input: {
            brand: "Honda",
            model: "Civic LX",
            year: 2023,
            plate: "ABC1D23",
            color: "Preto",
            fuelType: "FLEX",
            dealerId: null,
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should handle delete vehicle mutation success and error", async () => {
      vi.mocked(vehicleApi.remove).mockResolvedValueOnce(undefined as any);

      const { result } = renderHook(() => useDeleteVehicle(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vehicleApi.remove).toHaveBeenCalledWith(1);
    });

    it("should handle delete vehicle mutation error", async () => {
      vi.mocked(vehicleApi.remove).mockRejectedValueOnce(new Error("Delete error"));

      const { result } = renderHook(() => useDeleteVehicle(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
