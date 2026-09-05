import { useState, useMemo } from "react";
import { Plus, AlertTriangle, Search, X } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { useDealersPaginated } from "@/modules/dealers/hooks/use-dealers";
import { DealerTable } from "@/modules/dealers/components/dealer-table";
import { DealerFormDialog } from "@/modules/dealers/components/dealer-form-dialog";
import { DeleteDealerDialog } from "@/modules/dealers/components/delete-dealer-dialog";
import { DealerVehiclesDialog } from "@/modules/dealers/components/dealer-vehicles-dialog";
import { DealerTableSkeleton } from "@/shared/components/skeletons/dealer-table-skeleton";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { Dealer } from "@/modules/dealers/types/dealer";
import { getErrorMessage } from "@/shared/api/error";

export function DealersPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data: pageData, isLoading, isError, error } = useDealersPaginated(page, size);

  const dealers = pageData?.content;
  const totalPages = pageData?.totalPages ?? 1;
  const totalElements = pageData?.totalElements ?? 0;
  const isFirst = pageData?.first;
  const isLast = pageData?.last;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);
  const [viewingDealer, setViewingDealer] = useState<Dealer | null>(null);

  function openCreateForm() {
    setEditingDealer(null);
    setFormOpen(true);
  }

  function openEditForm(dealer: Dealer) {
    setEditingDealer(dealer);
    setFormOpen(true);
  }

  // Client-side filtering by name, CNPJ, or city for the loaded page items
  const filteredDealers = useMemo(() => {
    if (!dealers) return [];
    if (!debouncedSearch.trim()) return dealers;
    const query = debouncedSearch.toLowerCase().trim();
    return dealers.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.cnpj.toLowerCase().includes(query) ||
        d.city.toLowerCase().includes(query)
    );
  }, [dealers, debouncedSearch]);

  const isFiltered = debouncedSearch.trim().length > 0;

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

      {/* Instant Search Bar with 300ms Debounce */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por razão social, CNPJ ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar concessionárias por razão social, CNPJ ou cidade"
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
          onClearFilter={() => setSearchTerm("")}
          isLoading={false}
          onEdit={openEditForm}
          onDelete={setDeletingDealer}
          onViewVehicles={setViewingDealer}
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
      <DealerVehiclesDialog dealer={viewingDealer} onOpenChange={(open) => !open && setViewingDealer(null)} />
    </div>
  );
}
