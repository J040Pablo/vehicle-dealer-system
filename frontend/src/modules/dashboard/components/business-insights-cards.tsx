import { useMemo } from "react";
import { Building2, Car, TrendingUp, DollarSign } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";
import type { Dealer } from "@/modules/dealers/types/dealer";

interface BusinessInsightsProps {
  vehicles?: Vehicle[];
  dealers?: Dealer[];
}

export function TopDealersCard({ vehicles = [], dealers = [] }: BusinessInsightsProps) {
  const topDealers = useMemo(() => {
    const dealerMap = new Map<number, { name: string; count: number }>();

    // Seed from dealers list
    dealers.forEach((d) => {
      dealerMap.set(d.id, { name: d.name, count: d.totalVehicles ?? 0 });
    });

    // Re-verify from vehicles list
    vehicles.forEach((v) => {
      if (v.dealerId) {
        const existing = dealerMap.get(v.dealerId);
        if (existing) {
          existing.count = (existing.count || 0) + 1;
        } else if (v.dealerName) {
          dealerMap.set(v.dealerId, { name: v.dealerName, count: 1 });
        }
      }
    });

    const totalAssigned = vehicles.filter((v) => v.dealerId != null).length || 1;

    return Array.from(dealerMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((d) => ({
        ...d,
        percentage: Math.round((d.count / totalAssigned) * 100),
      }));
  }, [vehicles, dealers]);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Top Concessionárias</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Maiores volumes de frota associada
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {topDealers.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma concessionária com veículos</p>
        ) : (
          topDealers.map((d, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate max-w-[180px]">{d.name}</span>
                <span className="font-semibold text-muted-foreground tabular-nums">
                  {d.count} {d.count === 1 ? "veículo" : "veículos"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, d.percentage)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function MostExpensiveVehiclesCard({ vehicles = [] }: BusinessInsightsProps) {
  const topVehicles = useMemo(() => {
    return [...vehicles]
      .filter((v) => v.value != null && v.value > 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 5);
  }, [vehicles]);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Veículos de Maior Valor</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Modelos com maior precificação no catálogo
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {topVehicles.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum veículo precificado</p>
        ) : (
          topVehicles.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30 border border-border/30 hover:border-border/60 transition-all"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {v.brand} {v.model}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{v.year}</span>
                  {v.dealerName && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[100px]">{v.dealerName}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-xs tabular-nums border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 shrink-0">
                {formatCurrency(v.value)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function PricingMetricsCard({ vehicles = [] }: BusinessInsightsProps) {
  const stats = useMemo(() => {
    const priced = vehicles.filter((v) => v.value != null && v.value > 0);
    if (priced.length === 0) {
      return { total: 0, avg: 0, min: 0, max: 0, pricedCount: 0 };
    }

    const values = priced.map((v) => v.value as number);
    const total = values.reduce((acc, curr) => acc + curr, 0);
    const avg = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { total, avg, min, max, pricedCount: priced.length };
  }, [vehicles]);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Indicadores de Preço</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Métricas financeiras do inventário de veículos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
            Preço Médio por Veículo
          </p>
          <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
            {formatCurrency(stats.avg)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-md bg-muted/40 border border-border/30">
            <p className="text-[10px] text-muted-foreground font-medium uppercase">Menor Valor</p>
            <p className="font-semibold text-foreground tabular-nums mt-0.5">{formatCurrency(stats.min)}</p>
          </div>
          <div className="p-2.5 rounded-md bg-muted/40 border border-border/30">
            <p className="text-[10px] text-muted-foreground font-medium uppercase">Maior Valor</p>
            <p className="font-semibold text-foreground tabular-nums mt-0.5">{formatCurrency(stats.max)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
