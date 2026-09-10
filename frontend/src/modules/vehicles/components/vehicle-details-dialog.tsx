import { useState } from "react";
import { Car, Pencil, Building2, Calendar, ShieldCheck, Tag, DollarSign, Fuel, Palette, Hash } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FuelBadge } from "@/modules/vehicles/components/fuel-badge";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

interface VehicleDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onEdit?: (vehicle: Vehicle) => void;
}

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

function VehicleDetailImage({ url, brand, model }: { url?: string | null; brand: string; model: string }) {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = url?.trim();

  if (!normalizedUrl || hasError) {
    return (
      <div className="w-full h-48 sm:h-56 rounded-xl border border-border bg-muted/40 flex flex-col items-center justify-center text-muted-foreground/60 shadow-inner">
        <Car className="h-16 w-16 text-muted-foreground/50 mb-2 stroke-[1.5]" />
        <span className="text-xs font-medium text-muted-foreground/70">Sem foto disponível</span>
      </div>
    );
  }

  return (
    <div className="w-full h-48 sm:h-56 rounded-xl border border-border bg-muted/20 flex items-center justify-center overflow-hidden shadow-sm relative group">
      <img
        src={normalizedUrl}
        alt={`${brand} ${model}`}
        onError={() => setHasError(true)}
        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

export function VehicleDetailsDialog({ open, onOpenChange, vehicle, onEdit }: VehicleDetailsDialogProps) {
  if (!vehicle) return null;

  const formattedValue = vehicle.value != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(vehicle.value)
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Car className="h-4 w-4" />
            <span>Ficha Técnica</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {vehicle.brand} {vehicle.model}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Informações detalhadas do veículo cadastrado no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Image Banner */}
          <VehicleDetailImage url={vehicle.imageUrl} brand={vehicle.brand} model={vehicle.model} />

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/70">
            {/* Marca & Modelo */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Marca / Modelo
              </span>
              <p className="text-sm font-semibold text-foreground">
                {vehicle.brand} - {vehicle.model}
              </p>
            </div>

            {/* Ano */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Ano de Fabricação
              </span>
              <p className="text-sm font-semibold text-foreground">{vehicle.year}</p>
            </div>

            {/* Placa */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-primary" /> Placa
              </span>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-border bg-card font-mono text-xs font-bold tracking-wider text-foreground shadow-2xs">
                  {vehicle.plate}
                </span>
              </div>
            </div>

            {/* Chassi */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Chassi
              </span>
              <p className="text-xs font-mono font-medium text-foreground/90 break-all">
                {vehicle.chassis || <span className="text-muted-foreground/60 italic font-sans">Não informado</span>}
              </p>
            </div>

            {/* Cor */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" /> Cor
              </span>
              <p className="text-sm font-medium text-foreground">
                {vehicle.color || <span className="text-muted-foreground/60 italic">Não informada</span>}
              </p>
            </div>

            {/* Combustível */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5 text-primary" /> Combustível
              </span>
              <div>
                <FuelBadge fuelType={vehicle.fuelType} />
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" /> Valor Estimado
              </span>
              <p className="text-sm font-semibold font-mono text-foreground">{formattedValue}</p>
            </div>

            {/* Concessionária */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Concessionária
              </span>
              <p className="text-sm font-medium text-foreground">
                {vehicle.dealerName ? (
                  vehicle.dealerName
                ) : (
                  <span className="text-muted-foreground/60 italic">Sem concessionária vinculada</span>
                )}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3 gap-1 px-1">
            <span>Cadastrado em: <strong className="font-medium text-foreground/80">{formatDateTime(vehicle.createdAt)}</strong></span>
            <span>Última atualização: <strong className="font-medium text-foreground/80">{formatDateTime(vehicle.updatedAt)}</strong></span>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(vehicle);
              }}
              className="gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Editar Veículo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
