import { useMutation, useQueryClient } from "@tanstack/react-query";

import { vehicleApi } from "@/modules/vehicles/api/vehicle-api";
import type { VehicleInput } from "@/modules/vehicles/types/vehicle";
import { vehicleKeys } from "@/modules/vehicles/hooks/use-vehicles";
import { dealerKeys } from "@/modules/dealers/hooks/use-dealers";
import { toast } from "@/shared/hooks/use-toast";
import { getErrorMessage } from "@/shared/api/error";

function invalidateVehicleRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
  queryClient.invalidateQueries({ queryKey: dealerKeys.all });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) => vehicleApi.create(input),
    onSuccess: () => {
      invalidateVehicleRelatedQueries(queryClient);
      toast({ variant: "success", title: "Veículo cadastrado com sucesso." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Não foi possível cadastrar o veículo.", description: getErrorMessage(error) });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: VehicleInput }) => vehicleApi.update(id, input),
    onSuccess: () => {
      invalidateVehicleRelatedQueries(queryClient);
      toast({ variant: "success", title: "Veículo atualizado com sucesso." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Não foi possível atualizar o veículo.", description: getErrorMessage(error) });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleApi.remove(id),
    onSuccess: () => {
      invalidateVehicleRelatedQueries(queryClient);
      toast({ variant: "success", title: "Veículo excluído com sucesso." });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Não foi possível excluir o veículo.", description: getErrorMessage(error) });
    },
  });
}
