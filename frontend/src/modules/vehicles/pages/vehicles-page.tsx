import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, AlertTriangle, Search, X, Building2, Filter, Fuel } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { FUEL_TYPE_OPTIONS, FUEL_TYPE_LABELS } from "@/shared/utils/formatters";
import { useVehiclesPaginated } from "@/modules/vehicles/hooks/use-vehicles";
import { useDealers } from "@/modules/dealers/hooks/use-dealers";
import { VehicleTable } from "@/modules/vehicles/components/vehicle-table";
import { VehicleFormDialog } from "@/modules/vehicles/components/vehicle-form-dialog";
import { DeleteVehicleDialog } from "@/modules/vehicles/components/delete-vehicle-dialog";
import { VehicleDetailsDialog } from "@/modules/vehicles/components/vehicle-details-dialog";
import { VehicleTableSkeleton } from "@/shared/components/skeletons/vehicle-table-skeleton";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";
import { getErrorMessage } from "@/shared/api/error";

export function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract filters directly from URL searchParams
  const searchParamValue = searchParams.get("search") || "";
  const dealerIdParam = searchParams.get("dealerId");
  const selectedDealerId = dealerIdParam ? Number(dealerIdParam) : undefined;
  const fuelTypeParam = searchParams.get("fuelType") || "ALL";

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState(searchParamValue);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: dealers } = useDealers();

  // Reset to first page whenever filter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedDealerId, fuelTypeParam]);

  // Sync debounced search to URL
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams);
    if (debouncedSearch.trim()) {
      currentParams.set("search", debouncedSearch.trim());
    } else {
      currentParams.delete("search");
    }
    if (currentParams.toString() !== searchParams.toString()) {
      setSearchParams(currentParams, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  // Keep search input text in sync if URL changes externally
  useEffect(() => {
    if (searchParamValue !== searchTerm && searchParamValue !== debouncedSearch) {
      setSearchTerm(searchParamValue);
    }
  }, [searchParamValue]);

  const { data: pageData, isLoading, isError, error } = useVehiclesPaginated(
    page,
    size,
    debouncedSearch,
    selectedDealerId
  );

  const rawVehicles = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const isFirst = pageData?.first;
  const isLast = pageData?.last;

  // Filter vehicles client-side by fuelType if specified
  const filteredVehicles = useMemo(() => {
    if (fuelTypeParam === "ALL") return rawVehicles;
    return rawVehicles.filter((v) => v.fuelType === fuelTypeParam);
  }, [rawVehicles, fuelTypeParam]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);

  function openCreateForm() {
    setEditingVehicle(null);
    setFormOpen(true);
  }

  function openEditForm(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  }

  function handleDealerChange(value: string) {
    const currentParams = new URLSearchParams(searchParams);
    if (value === "ALL") {
      currentParams.delete("dealerId");
    } else {
      currentParams.set("dealerId", value);
    }
    setSearchParams(currentParams);
  }

  function handleFuelTypeChange(value: string) {
    const currentParams = new URLSearchParams(searchParams);
    if (value === "ALL") {
      currentParams.delete("fuelType");
    } else {
      currentParams.set("fuelType", value);
    }
    setSearchParams(currentParams);
  }

  function clearAllFilters() {
    setSearchTerm("");
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("search");
    currentParams.delete("dealerId");
    currentParams.delete("fuelType");
    setSearchParams(currentParams);
  }

  const isFiltered = searchParamValue.trim().length > 0 || selectedDealerId !== undefined || fuelTypeParam !== "ALL";
  const activeDealer = dealers?.find((d) => d.id === selectedDealerId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veículos"
        description="Gerencie o catálogo de veículos e a associação com concessionárias."
        action={
          <Button onClick={openCreateForm} className="w-full sm:w-auto shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo veículo
          </Button>
        }
      />

      {/* Filter Toolbar: Search + Dealer Dropdown + Fuel Type Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por marca, modelo ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar veículos por marca, modelo ou placa"
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                const currentParams = new URLSearchParams(searchParams);
                currentParams.delete("search");
                setSearchParams(currentParams);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-[220px]">
          <Select
            value={selectedDealerId ? String(selectedDealerId) : "ALL"}
            onValueChange={handleDealerChange}
          >
            <SelectTrigger aria-label="Filtrar por concessionária">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Todas as concessionárias" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as concessionárias</SelectItem>
              {dealers?.map((dealer) => (
                <SelectItem key={dealer.id} value={String(dealer.id)}>
                  {dealer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[180px]">
          <Select value={fuelTypeParam} onValueChange={handleFuelTypeChange}>
            <SelectTrigger aria-label="Filtrar por tipo de combustível">
              <div className="flex items-center gap-2 truncate">
                <Fuel className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Combustível" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os combustíveis</SelectItem>
              {FUEL_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {(activeDealer || fuelTypeParam !== "ALL") && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {activeDealer && (
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md border border-border">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span>Concessionária: <strong>{activeDealer.name}</strong></span>
              <button
                onClick={() => handleDealerChange("ALL")}
                className="ml-1 text-muted-foreground hover:text-foreground p-0.5 rounded-sm hover:bg-muted"
                aria-label="Remover filtro de concessionária"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {fuelTypeParam !== "ALL" && (
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md border border-border">
              <Fuel className="h-3.5 w-3.5 text-primary" />
              <span>Combustível: <strong>{FUEL_TYPE_LABELS[fuelTypeParam as keyof typeof FUEL_TYPE_LABELS] || fuelTypeParam}</strong></span>
              <button
                onClick={() => handleFuelTypeChange("ALL")}
                className="ml-1 text-muted-foreground hover:text-foreground p-0.5 rounded-sm hover:bg-muted"
                aria-label="Remover filtro de combustível"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <VehicleTableSkeleton />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar catálogo</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de veículos. {getErrorMessage(error)}
          </AlertDescription>
        </Alert>
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          rawVehiclesCount={totalElements}
          isFiltered={isFiltered}
          onClearFilter={clearAllFilters}
          isLoading={false}
          onView={setViewingVehicle}
          onEdit={openEditForm}
          onDelete={setDeletingVehicle}
          onCreate={openCreateForm}
          onSelectDealer={(dealerId) => handleDealerChange(String(dealerId))}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          onPageChange={setPage}
          onSizeChange={setSize}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}

      <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} vehicle={editingVehicle} />
      <DeleteVehicleDialog vehicle={deletingVehicle} onOpenChange={(open) => !open && setDeletingVehicle(null)} />
      <VehicleDetailsDialog
        open={!!viewingVehicle}
        onOpenChange={(open) => !open && setViewingVehicle(null)}
        vehicle={viewingVehicle}
        onEdit={openEditForm}
      />
    </div>
  );
}
