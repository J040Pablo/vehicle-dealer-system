import { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Eye, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { FuelBadge } from "@/modules/vehicles/components/fuel-badge";
import { VehicleTableSkeleton } from "@/shared/components/skeletons/vehicle-table-skeleton";
import { PaginationControls } from "@/shared/components/pagination-controls";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

interface VehicleTableProps {
  vehicles: Vehicle[] | undefined;
  rawVehiclesCount?: number;
  isFiltered?: boolean;
  onClearFilter?: () => void;
  isLoading: boolean;
  onView?: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onCreate: () => void;
  onSelectDealer?: (dealerId: number) => void;
  // Pagination props
  page?: number;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  onPageChange?: (newPage: number) => void;
  onSizeChange?: (newSize: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function VehicleThumbnail({ url, brand, model }: { url?: string | null; brand: string; model: string }) {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = url?.trim();

  if (!normalizedUrl || hasError) {
    return (
      <div className="h-14 w-24 shrink-0 rounded-md border border-border bg-muted/30 flex items-center justify-center text-muted-foreground/60 shadow-xs overflow-hidden">
        <Car className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30 flex items-center justify-center shadow-xs">
      <img
        src={normalizedUrl}
        alt={`${brand} ${model}`}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function VehicleTable({
  vehicles,
  isFiltered = false,
  onClearFilter,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onSelectDealer,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  size = 10,
  onPageChange,
  onSizeChange,
  isFirst,
  isLast,
}: VehicleTableProps) {
  if (isLoading) {
    return <VehicleTableSkeleton />;
  }

  if (!vehicles || vehicles.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          icon={Car}
          title="Nenhum veículo encontrado"
          description="Nenhum veículo corresponde aos termos buscados."
          actionLabel="Limpar busca"
          onAction={onClearFilter}
        />
      );
    }

    return (
      <EmptyState
        icon={Car}
        title="Nenhum veículo encontrado"
        description="Cadastre o primeiro veículo para começar."
        actionLabel="Cadastrar veículo"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm transition-colors">
      <div className="overflow-x-auto">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/80 bg-muted/30">
              <TableHead className="w-[90px]"></TableHead>
              <TableHead className="w-[130px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marca</TableHead>
              <TableHead className="w-[150px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modelo</TableHead>
              <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ano</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Placa</TableHead>
              <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cor</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Combustível</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor (R$)</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Concessionária</TableHead>
              <TableHead className="text-right w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="transition-colors hover:bg-muted/40 group">
                <TableCell className="py-2.5 pl-4 pr-0">
                  <VehicleThumbnail url={vehicle.imageUrl} brand={vehicle.brand} model={vehicle.model} />
                </TableCell>
                <TableCell className="font-semibold text-foreground">{vehicle.brand}</TableCell>
                <TableCell className="text-foreground/90">{vehicle.model}</TableCell>
                <TableCell className="text-muted-foreground">{vehicle.year}</TableCell>
                <TableCell className="font-mono text-xs tracking-wider font-medium text-foreground/80">{vehicle.plate}</TableCell>
                <TableCell className="text-xs text-foreground/90 font-medium">{vehicle.color || "-"}</TableCell>
                <TableCell>
                  <FuelBadge fuelType={vehicle.fuelType} />
                </TableCell>
                <TableCell className="text-xs font-mono text-foreground/90 font-semibold">
                  {vehicle.value != null
                    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(vehicle.value)
                    : "-"}
                </TableCell>
                <TableCell>
                  {vehicle.dealerName && vehicle.dealerId ? (
                    <Link
                      to={`/vehicles?dealerId=${vehicle.dealerId}`}
                      onClick={() => vehicle.dealerId && onSelectDealer?.(vehicle.dealerId)}
                      className="text-foreground font-medium hover:underline text-left cursor-pointer hover:text-primary transition-colors"
                      title={`Filtrar veículos da concessionária ${vehicle.dealerName}`}
                    >
                      {vehicle.dealerName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/70 italic text-xs">Sem concessionária</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(vehicle)}
                        aria-label={`Visualizar detalhes do veículo ${vehicle.brand} ${vehicle.model}`}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(vehicle)}
                      aria-label={`Editar veículo ${vehicle.brand} ${vehicle.model}`}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(vehicle)}
                      aria-label={`Excluir veículo ${vehicle.brand} ${vehicle.model}`}
                      className="h-8 w-8 text-destructive/80 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
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

      {onPageChange && onSizeChange && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}
    </div>
  );
}
