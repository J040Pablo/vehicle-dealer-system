import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { useVehicles } from "@/modules/vehicles/hooks/use-vehicles";
import { VehicleTable } from "@/modules/vehicles/components/vehicle-table";
import { VehicleFormDialog } from "@/modules/vehicles/components/vehicle-form-dialog";
import { DeleteVehicleDialog } from "@/modules/vehicles/components/delete-vehicle-dialog";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";
import { getErrorMessage } from "@/shared/api/error";

export function VehiclesPage() {
  const { data: vehicles, isLoading, isError, error } = useVehicles();

  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  function openCreateForm() {
    setEditingVehicle(null);
    setFormOpen(true);
  }

  function openEditForm(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veículos"
        description="Gerencie o catálogo de veículos e a associação com concessionárias."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            Novo veículo
          </Button>
        }
      />

      {isError ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>Não foi possível carregar os veículos. {getErrorMessage(error)}</p>
        </div>
      ) : (
        <VehicleTable
          vehicles={vehicles}
          isLoading={isLoading}
          onEdit={openEditForm}
          onDelete={setDeletingVehicle}
          onCreate={openCreateForm}
        />
      )}

      <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} vehicle={editingVehicle} />
      <DeleteVehicleDialog vehicle={deletingVehicle} onOpenChange={(open) => !open && setDeletingVehicle(null)} />
    </div>
  );
}
