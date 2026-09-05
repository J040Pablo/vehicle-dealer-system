import { Car } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { FuelBadge } from "@/modules/vehicles/components/fuel-badge";
import { useVehicles } from "@/modules/vehicles/hooks/use-vehicles";
import type { Dealer } from "@/modules/dealers/types/dealer";

interface DealerVehiclesDialogProps {
  dealer: Dealer | null;
  onOpenChange: (open: boolean) => void;
}

export function DealerVehiclesDialog({ dealer, onOpenChange }: DealerVehiclesDialogProps) {
  const { data: vehicles, isLoading } = useVehicles(dealer?.id);

  return (
    <Dialog open={!!dealer} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Veículos de {dealer?.name}</DialogTitle>
          <DialogDescription>Veículos atualmente vinculados a esta concessionária.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !vehicles || vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="Nenhum veículo vinculado"
            description="Esta concessionária ainda não possui veículos associados."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{vehicle.plate}</p>
                </div>
                <FuelBadge fuelType={vehicle.fuelType} />
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
