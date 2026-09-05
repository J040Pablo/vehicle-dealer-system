import { useState, useMemo } from "react";
import { Plus, AlertTriangle, Search, X } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { useVehiclesPaginated } from "@/modules/vehicles/hooks/use-vehicles";
import { VehicleTable } from "@/modules/vehicles/components/vehicle-table";
import { VehicleFormDialog } from "@/modules/vehicles/components/vehicle-form-dialog";
import { DeleteVehicleDialog } from "@/modules/vehicles/components/delete-vehicle-dialog";
import { VehicleTableSkeleton } from "@/shared/components/skeletons/vehicle-table-skeleton";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { Vehicle } from "@/modules/vehicles/types/vehicle";
import { getErrorMessage } from "@/shared/api/error";

export function VehiclesPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data: pageData, isLoading, isError, error } = useVehiclesPaginated(page, size);

  const vehicles = pageData?.content;
  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const isFirst = pageData?.first;
  const isLast = pageData?.last;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  function openCreateForm() {
    setEditingVehicle(null);
    setFormOpen(true);
  }

  function openEditForm(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  }

  // Client-side filtering by brand, model, plate for the loaded page items
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    if (!debouncedSearch.trim()) return vehicles;
    const query = debouncedSearch.toLowerCase().trim();
    return vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.plate.toLowerCase().includes(query)
    );
  }, [vehicles, debouncedSearch]);

  const isFiltered = debouncedSearch.trim().length > 0;

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

      {/* Instant Search Bar with 300ms Debounce */}
      <div className="relative max-w-md">
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
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

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
          onClearFilter={() => setSearchTerm("")}
          isLoading={false}
          onEdit={openEditForm}
          onDelete={setDeletingVehicle}
          onCreate={openCreateForm}
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
    </div>
  );
}
