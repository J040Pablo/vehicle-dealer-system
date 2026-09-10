import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FUEL_TYPE_BADGE_CLASSES, FUEL_TYPE_LABELS, formatCurrency, formatDate } from "@/shared/utils/formatters";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";

interface RecentVehiclesTableProps {
  vehicles?: Vehicle[];
}

export function RecentVehiclesTable({ vehicles = [] }: RecentVehiclesTableProps) {
  const recentVehicles = useMemo(() => {
    return [...vehicles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [vehicles]);

  if (recentVehicles.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">Veículos Recentes</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Últimos modelos cadastrados no sistema
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground">
          <Link to="/veiculos">
            Ver catálogo completo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border/40 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Veículo</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ano</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Combustível</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Concessionária</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Cadastrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/30 border-border/30">
                  <TableCell className="font-medium text-xs py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border/40">
                        {vehicle.imageUrl ? (
                          <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <Car className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{vehicle.plate}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium py-3">
                    {vehicle.year}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full ${FUEL_TYPE_BADGE_CLASSES[vehicle.fuelType]}`}>
                      {FUEL_TYPE_LABELS[vehicle.fuelType] || vehicle.fuelType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3">
                    {vehicle.dealerName ? (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{vehicle.dealerName}</span>
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground text-right tabular-nums py-3">
                    {formatCurrency(vehicle.value)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground text-right py-3 tabular-nums">
                    {formatDate(vehicle.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
