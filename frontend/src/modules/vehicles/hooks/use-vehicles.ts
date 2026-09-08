import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { vehicleApi, type VehicleQueryParams } from "@/modules/vehicles/api/vehicle-api";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  paginated: (page: number, size: number, search?: string, dealerId?: number) =>
    ["vehicles", page, size, search ?? "", dealerId ?? null] as const,
};

export function useVehiclesPaginated(page = 0, size = 10, search?: string, dealerId?: number) {
  return useQuery({
    queryKey: vehicleKeys.paginated(page, size, search, dealerId),
    queryFn: () => vehicleApi.list({ page, size, search, dealerId }),
    placeholderData: keepPreviousData,
  });
}

/** Hook helper for fetching full vehicles list (e.g. for dashboard metrics / dialogs) */
export function useVehicles(dealerId?: number) {
  return useQuery({
    queryKey: [...vehicleKeys.all, "all", { dealerId: dealerId ?? null }],
    queryFn: () => vehicleApi.listAll(dealerId),
  });
}
