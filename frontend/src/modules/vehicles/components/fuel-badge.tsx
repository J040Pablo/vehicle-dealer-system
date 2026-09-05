import { cn } from "@/shared/lib/utils";
import { FUEL_TYPE_BADGE_CLASSES, FUEL_TYPE_LABELS } from "@/shared/utils/formatters";
import type { FuelType } from "@/modules/vehicles/types/vehicle";

export function FuelBadge({ fuelType }: { fuelType: FuelType }) {
  const label = FUEL_TYPE_LABELS[fuelType] ?? fuelType;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        FUEL_TYPE_BADGE_CLASSES[fuelType] ?? "bg-secondary text-secondary-foreground"
      )}
      aria-label={`Combustível: ${label}`}
    >
      {label}
    </span>
  );
}
