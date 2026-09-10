import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, Car, CarFront, Flame, DollarSign, Plus, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import {
  VehiclesByBrandChart,
  VehiclesByFuelChart,
  VehiclesByYearChart,
} from "@/modules/dashboard/components/analytics-charts";
import {
  TopDealersCard,
  MostExpensiveVehiclesCard,
  PricingMetricsCard,
} from "@/modules/dashboard/components/business-insights-cards";
import { RecentVehiclesTable } from "@/modules/dashboard/components/recent-activity-table";
import { useVehicles } from "@/modules/vehicles/hooks/use-vehicles";
import { useDealers } from "@/modules/dealers/hooks/use-dealers";
import { DashboardSkeleton } from "@/shared/components/skeletons/dashboard-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { EmptyState } from "@/shared/components/empty-state";
import { getErrorMessage } from "@/shared/api/error";
import { formatCurrency } from "@/shared/utils/formatters";

export function DashboardPage() {
  const { data: vehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles, error: errorVehicles } = useVehicles();
  const { data: dealers, isLoading: isLoadingDealers, isError: isErrorDealers, error: errorDealers } = useDealers();

  const isLoading = isLoadingVehicles || isLoadingDealers;
  const isError = isErrorVehicles || isErrorDealers;

  const metrics = useMemo(() => {
    if (!vehicles) {
      return {
        totalVehicles: 0,
        unassignedCount: 0,
        fuelTypesCount: 0,
        totalValue: 0,
        avgValue: 0,
      };
    }

    const totalVehicles = vehicles.length;
    const unassignedCount = vehicles.filter(
      (v) => v.dealerId === null || v.dealerId === undefined
    ).length;
    const fuelTypesCount = new Set(vehicles.map((v) => v.fuelType)).size;

    const pricedVehicles = vehicles.filter((v) => v.value != null && v.value > 0);
    const totalValue = pricedVehicles.reduce((sum, v) => sum + (v.value as number), 0);
    const avgValue = pricedVehicles.length > 0 ? totalValue / pricedVehicles.length : 0;

    return {
      totalVehicles,
      unassignedCount,
      fuelTypesCount,
      totalValue,
      avgValue,
    };
  }, [vehicles]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Visão geral corporativa e inteligência de mercado do sistema."
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Visão geral corporativa e inteligência de mercado do sistema."
        />
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

  const hasNoData = (!vehicles || vehicles.length === 0) && (!dealers || dealers.length === 0);

  return (
    <div className="space-y-8">
      {/* Enterprise Header with Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Dashboard"
          description="Visão geral corporativa e inteligência de mercado do sistema."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 text-xs">
            <Link to="/concessionarias">
              <Plus className="h-3.5 w-3.5" />
              Nova Concessionária
            </Link>
          </Button>
          <Button size="sm" asChild className="h-9 gap-1.5 text-xs">
            <Link to="/veiculos">
              <Plus className="h-3.5 w-3.5" />
              Novo Veículo
            </Link>
          </Button>
        </div>
      </div>

      {hasNoData ? (
        <EmptyState
          icon={Car}
          title="Sem dados disponíveis"
          description="Cadastre veículos e concessionárias para visualizar métricas."
        />
      ) : (
        <>
          {/* SECTION 1: 5 KPI Cards Responsive Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total de veículos"
              value={metrics.totalVehicles}
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
              value={metrics.unassignedCount}
              icon={CarFront}
              accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              tooltipText="Veículos não vinculados a nenhuma concessionária"
            />
            <StatCard
              label="Tipos de combustível"
              value={metrics.fuelTypesCount}
              icon={Flame}
              accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              tooltipText="Variedade de fontes de combustível no catálogo"
            />
            <StatCard
              label="Valor total do estoque"
              value={formatCurrency(metrics.totalValue)}
              icon={DollarSign}
              accentClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              tooltipText="Soma do valor financeiro de todos os veículos precificados"
              subtext={`Média: ${formatCurrency(metrics.avgValue)}`}
            />
          </div>

          {/* SECTION 2: Analytics Section (Recharts) */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Análise de Frota & Mercado
            </h2>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <VehiclesByBrandChart vehicles={vehicles} />
              <VehiclesByFuelChart vehicles={vehicles} />
              <VehiclesByYearChart vehicles={vehicles} />
            </div>
          </div>

          {/* SECTION 3: Business Insights Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Insights de Negócio
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <TopDealersCard vehicles={vehicles} dealers={dealers} />
              <MostExpensiveVehiclesCard vehicles={vehicles} />
              <PricingMetricsCard vehicles={vehicles} />
            </div>
          </div>

          {/* SECTION 4: Recent Activity Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Atividade Recente
            </h2>
            <RecentVehiclesTable vehicles={vehicles} />
          </div>
        </>
      )}
    </div>
  );
}
