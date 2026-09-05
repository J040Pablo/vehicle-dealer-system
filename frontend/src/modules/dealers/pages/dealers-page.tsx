import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { useDealers } from "@/modules/dealers/hooks/use-dealers";
import { DealerTable } from "@/modules/dealers/components/dealer-table";
import { DealerFormDialog } from "@/modules/dealers/components/dealer-form-dialog";
import { DeleteDealerDialog } from "@/modules/dealers/components/delete-dealer-dialog";
import { DealerVehiclesDialog } from "@/modules/dealers/components/dealer-vehicles-dialog";
import type { Dealer } from "@/modules/dealers/types/dealer";
import { getErrorMessage } from "@/shared/api/error";

export function DealersPage() {
  const { data: dealers, isLoading, isError, error } = useDealers();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);
  const [viewingDealer, setViewingDealer] = useState<Dealer | null>(null);

  function openCreateForm() {
    setEditingDealer(null);
    setFormOpen(true);
  }

  function openEditForm(dealer: Dealer) {
    setEditingDealer(dealer);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concessionárias"
        description="Gerencie as concessionárias parceiras e seus veículos vinculados."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            Nova concessionária
          </Button>
        }
      />

      {isError ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>Não foi possível carregar as concessionárias. {getErrorMessage(error)}</p>
        </div>
      ) : (
        <DealerTable
          dealers={dealers}
          isLoading={isLoading}
          onEdit={openEditForm}
          onDelete={setDeletingDealer}
          onViewVehicles={setViewingDealer}
          onCreate={openCreateForm}
        />
      )}

      <DealerFormDialog open={formOpen} onOpenChange={setFormOpen} dealer={editingDealer} />
      <DeleteDealerDialog dealer={deletingDealer} onOpenChange={(open) => !open && setDeletingDealer(null)} />
      <DealerVehiclesDialog dealer={viewingDealer} onOpenChange={(open) => !open && setViewingDealer(null)} />
    </div>
  );
}
