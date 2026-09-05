import { Building2, Car } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { FuelBreakdownCard } from "@/modules/dashboard/components/fuel-breakdown-card";
import { useVehicles } from "@/modules/vehicles/hooks/use-vehicles";
import { useDealers } from "@/modules/dealers/hooks/use-dealers";

export function DashboardPage() {
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { data: dealers, isLoading: isLoadingDealers } = useDealers();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral do catálogo de veículos e concessionárias." />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total de veículos"
          value={vehicles?.length ?? 0}
          icon={Car}
          isLoading={isLoadingVehicles}
        />
        <StatCard
          label="Total de concessionárias"
          value={dealers?.length ?? 0}
          icon={Building2}
          isLoading={isLoadingDealers}
        />
      </div>

      <FuelBreakdownCard vehicles={vehicles} isLoading={isLoadingVehicles} />
    </div>
  );
}
