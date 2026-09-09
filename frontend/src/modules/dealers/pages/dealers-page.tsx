import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, AlertTriangle, Search, X, Car } from "lucide-react";

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
import { useDealersPaginated } from "@/modules/dealers/hooks/use-dealers";
import { DealerTable } from "@/modules/dealers/components/dealer-table";
import { DealerFormDialog } from "@/modules/dealers/components/dealer-form-dialog";
import { DeleteDealerDialog } from "@/modules/dealers/components/delete-dealer-dialog";
import { DealerTableSkeleton } from "@/shared/components/skeletons/dealer-table-skeleton";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { Dealer } from "@/modules/dealers/types/dealer";
import { getErrorMessage } from "@/shared/api/error";

export function DealersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Derive filter state directly from URL searchParams
  const searchParamValue = searchParams.get("search") || "";
  const vehicleFilterParam = searchParams.get("vehicleFilter") || "ALL";

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState(searchParamValue);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: pageData, isLoading, isError, error } = useDealersPaginated(page, size);

  const dealers = pageData?.content;
  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const isFirst = pageData?.first;
  const isLast = pageData?.last;

  const [formOpen, setFormOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);

  // Synchronize debounced search to URL searchParams
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

  // Keep internal text state in sync if URL changes externally
  useEffect(() => {
    if (searchParamValue !== searchTerm && searchParamValue !== debouncedSearch) {
      setSearchTerm(searchParamValue);
    }
  }, [searchParamValue]);

  function openCreateForm() {
    setEditingDealer(null);
    setFormOpen(true);
  }

  function openEditForm(dealer: Dealer) {
    setEditingDealer(dealer);
    setFormOpen(true);
  }

  function handleVehicleFilterChange(value: string) {
    const currentParams = new URLSearchParams(searchParams);
    if (value === "ALL") {
      currentParams.delete("vehicleFilter");
    } else {
      currentParams.set("vehicleFilter", value);
    }
    setSearchParams(currentParams);
  }

  function handleSearchInputChange(value: string) {
    setSearchTerm(value);
  }

  function clearFilters() {
    setSearchTerm("");
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("search");
    currentParams.delete("vehicleFilter");
    setSearchParams(currentParams);
  }

  // Client-side filtering by name, CNPJ, city/state or vehicle association status
  const filteredDealers = useMemo(() => {
    if (!dealers) return [];
    let result = dealers;

    const query = debouncedSearch.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.cnpj.toLowerCase().includes(query) ||
          d.city.toLowerCase().includes(query)
      );
    }

    if (vehicleFilterParam === "WITH_VEHICLES") {
      result = result.filter((d) => (d.totalVehicles ?? 0) > 0);
    } else if (vehicleFilterParam === "WITHOUT_VEHICLES") {
      result = result.filter((d) => (d.totalVehicles ?? 0) === 0);
    }

    return result;
  }, [dealers, debouncedSearch, vehicleFilterParam]);

  const isFiltered = searchParamValue.trim().length > 0 || vehicleFilterParam !== "ALL";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Concessionárias"
        description="Gerencie as concessionárias parceiras e seus veículos vinculados."
        action={
          <Button onClick={openCreateForm} className="w-full sm:w-auto shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Nova concessionária
          </Button>
        }
      />

      {/* Filter Toolbar: Instant Search + Vehicle Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por razão social, CNPJ ou cidade..."
            value={searchTerm}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            aria-label="Buscar concessionárias por razão social, CNPJ ou cidade"
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
          <Select value={vehicleFilterParam} onValueChange={handleVehicleFilterChange}>
            <SelectTrigger aria-label="Filtrar por presença de veículos">
              <div className="flex items-center gap-2 truncate">
                <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Status de Veículos" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as concessionárias</SelectItem>
              <SelectItem value="WITH_VEHICLES">Com veículos</SelectItem>
              <SelectItem value="WITHOUT_VEHICLES">Sem veículos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <DealerTableSkeleton />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar concessionárias</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de concessionárias. {getErrorMessage(error)}
          </AlertDescription>
        </Alert>
      ) : (
        <DealerTable
          dealers={filteredDealers}
          rawDealersCount={totalElements}
          isFiltered={isFiltered}
          onClearFilter={clearFilters}
          isLoading={false}
          onEdit={openEditForm}
          onDelete={setDeletingDealer}
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

      <DealerFormDialog open={formOpen} onOpenChange={setFormOpen} dealer={editingDealer} />
      <DeleteDealerDialog dealer={deletingDealer} onOpenChange={(open) => !open && setDeletingDealer(null)} />
    </div>
  );
}
