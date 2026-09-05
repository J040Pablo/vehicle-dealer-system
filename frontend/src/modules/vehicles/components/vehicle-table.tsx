import { Car, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { FuelBadge } from "@/modules/vehicles/components/fuel-badge";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

interface VehicleTableProps {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onCreate: () => void;
}

export function VehicleTable({ vehicles, isLoading, onEdit, onDelete, onCreate }: VehicleTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="Nenhum veículo cadastrado"
        description="Cadastre o primeiro veículo do catálogo para começar."
        actionLabel="Novo veículo"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Combustível</TableHead>
            <TableHead>Concessionária</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.brand}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell className="font-mono text-xs">{vehicle.plate}</TableCell>
              <TableCell>
                <FuelBadge fuelType={vehicle.fuelType} />
              </TableCell>
              <TableCell>
                {vehicle.dealerName ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(vehicle)} aria-label="Editar veículo">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(vehicle)}
                    aria-label="Excluir veículo"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
