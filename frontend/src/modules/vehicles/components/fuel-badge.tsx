import { cn } from "@/shared/lib/utils";
import { FUEL_TYPE_BADGE_CLASSES, FUEL_TYPE_LABELS } from "@/shared/utils/formatters";
import type { FuelType } from "@/modules/vehicles/types/vehicle";
import { Badge } from "@/shared/components/ui/badge";

export function FuelBadge({ fuelType }: { fuelType: FuelType }) {
  const label = FUEL_TYPE_LABELS[fuelType] ?? fuelType;
  const extraClasses = FUEL_TYPE_BADGE_CLASSES[fuelType];

  return (
    <Badge
      variant="secondary"
      className={cn("tracking-wide font-medium", extraClasses)}
      aria-label={`Combustível: ${label}`}
    >
      {label}
    </Badge>
  );
}
