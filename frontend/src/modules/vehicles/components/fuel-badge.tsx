import { cn } from "@/shared/lib/utils";
import { FUEL_TYPE_BADGE_CLASSES, FUEL_TYPE_LABELS } from "@/shared/utils/formatters";
import type { FuelType } from "@/modules/vehicles/types/vehicle";

export function FuelBadge({ fuelType }: { fuelType: FuelType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        FUEL_TYPE_BADGE_CLASSES[fuelType]
      )}
    >
      {FUEL_TYPE_LABELS[fuelType]}
    </span>
  );
}
