import { Building2, Car, CarFront, Flame, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { FuelBreakdownCard } from "@/modules/dashboard/components/fuel-breakdown-card";
import { useVehicles } from "@/modules/vehicles/hooks/use-vehicles";
import { useDealers } from "@/modules/dealers/hooks/use-dealers";
import { DashboardSkeleton } from "@/shared/components/skeletons/dashboard-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { EmptyState } from "@/shared/components/empty-state";
import { getErrorMessage } from "@/shared/api/error";

export function DashboardPage() {
  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles, error: errorVehicles } = useVehicles();
  const { data: dealers, isLoading: isLoadingDealers, isError: isErrorDealers, error: errorDealers } = useDealers();

  const isLoading = isLoadingVehicles || isLoadingDealers;
  const isError = isErrorVehicles || isErrorDealers;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Visão geral do catálogo de veículos e concessionárias." />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Visão geral do catálogo de veículos e concessionárias." />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar o dashboard</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados métricos. {getErrorMessage(errorVehicles || errorDealers)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const unassignedVehiclesCount = vehicles?.filter((v) => v.dealerId === null || v.dealerId === undefined).length ?? 0;
  const fuelTypesCount = new Set(vehicles?.map((v) => v.fuelType)).size;
  const hasNoData = (!vehicles || vehicles.length === 0) && (!dealers || dealers.length === 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral do catálogo de veículos e concessionárias." />

      {/* 4 Cards Responsive Grid (1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de veículos"
          value={vehicles?.length ?? 0}
          icon={Car}
          tooltipText="Total de veículos cadastrados no sistema"
        />
        <StatCard
          label="Total de concessionárias"
          value={dealers?.length ?? 0}
          icon={Building2}
          tooltipText="Total de concessionárias parceiras cadastradas"
        />
        <StatCard
          label="Veículos sem concessionária"
          value={unassignedVehiclesCount}
          icon={CarFront}
          accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          tooltipText="Veículos não vinculados a nenhuma concessionária"
        />
        <StatCard
          label="Tipos de combustível"
          value={fuelTypesCount}
          icon={Flame}
          accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          tooltipText="Variedade de fontes de combustível no catálogo"
        />
      </div>

      {hasNoData ? (
        <EmptyState
          icon={Car}
          title="Sem dados disponíveis"
          description="Cadastre veículos e concessionárias para visualizar métricas."
        />
      ) : (
        <FuelBreakdownCard vehicles={vehicles} isLoading={false} />
      )}
    </div>
  );
}
