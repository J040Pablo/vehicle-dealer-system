import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dealerApi } from "@/modules/dealers/api/dealer-api";
import type { DealerInput } from "@/modules/dealers/types/dealer";
import { dealerKeys } from "@/modules/dealers/hooks/use-dealers";
import { vehicleKeys } from "@/modules/vehicles/hooks/use-vehicles";
import { toast } from "@/shared/hooks/use-toast";
import { getErrorMessage } from "@/shared/api/error";

export function useCreateDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DealerInput) => dealerApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealerKeys.all });
      toast({ variant: "success", title: "Concessionária cadastrada com sucesso." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Não foi possível cadastrar a concessionária.",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: DealerInput }) => dealerApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealerKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast({ variant: "success", title: "Concessionária atualizada com sucesso." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Não foi possível atualizar a concessionária.",
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dealerApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealerKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      toast({ variant: "success", title: "Concessionária excluída com sucesso." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Não foi possível excluir a concessionária.",
        description: getErrorMessage(error),
      });
    },
  });
}
