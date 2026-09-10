import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FUEL_TYPE_LABELS } from "@/shared/utils/formatters";
import type { Vehicle, FuelType } from "@/modules/vehicles/types/vehicle";

interface AnalyticsChartsProps {
  vehicles?: Vehicle[];
}

const FUEL_COLORS: Record<FuelType, string> = {
  FLEX: "#38bdf8", // Sky blue
  GASOLINA: "#fbbf24", // Amber
  DIESEL: "#a1a1aa", // Zinc/Muted
  ELETRICO: "#c084fc", // Purple
  HIBRIDO: "#2dd4bf", // Teal
  ETANOL: "#34d399", // Emerald
};

export function VehiclesByBrandChart({ vehicles = [] }: AnalyticsChartsProps) {
  const data = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    vehicles.forEach((v) => {
      if (v.brand) {
        brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1;
      }
    });

    return Object.entries(brandCounts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [vehicles]);

  if (data.length === 0) {
    return (
      <Card className="border-border/60 bg-card/60 shadow-none flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">Sem dados de marcas disponíveis</p>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Veículos por Marca</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Distribuição dos principais fabricantes em estoque
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="brand"
                type="category"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={75}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-popover p-2 text-xs shadow-md">
                        <p className="font-semibold text-popover-foreground">{item.brand}</p>
                        <p className="text-muted-foreground">{item.count} veículo(s)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function VehiclesByFuelChart({ vehicles = [] }: AnalyticsChartsProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => {
      if (v.fuelType) {
        counts[v.fuelType] = (counts[v.fuelType] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([type, count]) => ({
      name: FUEL_TYPE_LABELS[type as FuelType] || type,
      code: type as FuelType,
      value: count,
      color: FUEL_COLORS[type as FuelType] || "#94a3b8",
    }));
  }, [vehicles]);

  if (data.length === 0) {
    return (
      <Card className="border-border/60 bg-card/60 shadow-none flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">Sem dados de combustível disponíveis</p>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Matriz de Combustível</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Proporção por tipo de motorização e energia
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[200px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-popover p-2 text-xs shadow-md">
                        <p className="font-semibold text-popover-foreground">{item.name}</p>
                        <p className="text-muted-foreground">{item.value} unidade(s)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/40 text-xs">
          {data.map((item) => (
            <div key={item.code} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate text-muted-foreground font-medium">{item.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VehiclesByYearChart({ vehicles = [] }: AnalyticsChartsProps) {
  const data = useMemo(() => {
    const yearCounts: Record<number, number> = {};
    vehicles.forEach((v) => {
      if (v.year) {
        yearCounts[v.year] = (yearCounts[v.year] || 0) + 1;
      }
    });

    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: String(year), count }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [vehicles]);

  if (data.length === 0) {
    return (
      <Card className="border-border/60 bg-card/60 shadow-none flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">Sem dados de ano disponíveis</p>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Veículos por Ano</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Distribuição temporal dos modelos cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="year" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-popover p-2 text-xs shadow-md">
                        <p className="font-semibold text-popover-foreground">Ano {item.year}</p>
                        <p className="text-muted-foreground">{item.count} veículo(s)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
