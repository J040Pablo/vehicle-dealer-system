import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { FUEL_TYPE_LABELS } from "@/shared/utils/formatters";
import type { FuelType, Vehicle } from "@/modules/vehicles/types/vehicle";

const BAR_COLOR_CLASSES: Record<FuelType, string> = {
  GASOLINA: "bg-amber-400",
  ETANOL: "bg-emerald-400",
  FLEX: "bg-sky-400",
  DIESEL: "bg-zinc-400",
  ELETRICO: "bg-teal-400",
  HIBRIDO: "bg-violet-400",
};

interface FuelBreakdownCardProps {
  vehicles: Vehicle[] | undefined;
  isLoading: boolean;
}

export function FuelBreakdownCard({ vehicles, isLoading }: FuelBreakdownCardProps) {
  const fuelTypes = Object.keys(FUEL_TYPE_LABELS) as FuelType[];
  const total = vehicles?.length ?? 0;

  const counts = fuelTypes.map((fuelType) => ({
    fuelType,
    count: vehicles?.filter((v) => v.fuelType === fuelType).length ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Veículos por combustível</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado ainda.</p>
        ) : (
          counts
            .filter(({ count }) => count > 0)
            .map(({ fuelType, count }) => (
              <div key={fuelType} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{FUEL_TYPE_LABELS[fuelType]}</span>
                  <span className="text-muted-foreground tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${BAR_COLOR_CLASSES[fuelType]}`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}
