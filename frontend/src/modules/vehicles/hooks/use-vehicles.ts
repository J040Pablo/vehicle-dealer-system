import { useQuery } from "@tanstack/react-query";

import { vehicleApi } from "@/modules/vehicles/api/vehicle-api";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  list: (dealerId?: number) => [...vehicleKeys.all, { dealerId: dealerId ?? null }] as const,
};

export function useVehicles(dealerId?: number) {
  return useQuery({
    queryKey: vehicleKeys.list(dealerId),
    queryFn: () => vehicleApi.list(dealerId),
  });
}
