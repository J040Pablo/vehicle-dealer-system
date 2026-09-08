import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog";
import { useDeleteVehicle } from "@/modules/vehicles/hooks/use-vehicle-mutations";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVehicleDialog({ vehicle, onOpenChange }: DeleteVehicleDialogProps) {
  const deleteVehicle = useDeleteVehicle();

  return (
    <ConfirmDeleteDialog
      open={!!vehicle}
      onOpenChange={onOpenChange}
      title="Excluir veículo"
      description={
        vehicle
          ? `Tem certeza que deseja excluir "${vehicle.brand} ${vehicle.model}" (placa ${vehicle.plate})? Esta ação não pode ser desfeita.`
          : ""
      }
      isPending={deleteVehicle.isPending}
      onConfirm={() => {
        if (!vehicle) return;
        deleteVehicle.mutate(vehicle.id, {
          onSuccess: () => onOpenChange(false),
        });
      }}
    />
  );
}
