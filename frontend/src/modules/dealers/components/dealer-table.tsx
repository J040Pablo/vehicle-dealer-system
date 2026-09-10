import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Pencil, Trash2, ArrowRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { DealerTableSkeleton } from "@/shared/components/skeletons/dealer-table-skeleton";
import { PaginationControls } from "@/shared/components/pagination-controls";
import type { Dealer } from "@/modules/dealers/types/dealer";

interface DealerTableProps {
  dealers: Dealer[] | undefined;
  rawDealersCount?: number;
  isFiltered?: boolean;
  onClearFilter?: () => void;
  isLoading: boolean;
  onEdit: (dealer: Dealer) => void;
  onDelete: (dealer: Dealer) => void;
  onViewVehicles?: (dealer: Dealer) => void;
  onCreate: () => void;
  // Pagination props
  page?: number;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  onPageChange?: (newPage: number) => void;
  onSizeChange?: (newSize: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function DealerThumbnail({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = imageUrl?.trim();

  if (!normalizedUrl || hasError) {
    return (
      <div className="h-10 w-10 shrink-0 rounded-md border border-border bg-muted/30 flex items-center justify-center text-muted-foreground/60 shadow-xs overflow-hidden">
        <Building2 className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30 flex items-center justify-center shadow-xs">
      <img
        src={normalizedUrl}
        alt={name}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function DealerTable({
  dealers,
  isFiltered = false,
  onClearFilter,
  isLoading,
  onEdit,
  onDelete,
  onViewVehicles,
  onCreate,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  size = 10,
  onPageChange,
  onSizeChange,
  isFirst,
  isLast,
}: DealerTableProps) {
  if (isLoading) {
    return <DealerTableSkeleton />;
  }

  if (!dealers || dealers.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          icon={Building2}
          title="Nenhuma concessionária encontrada"
          description="Nenhuma concessionária atende aos termos buscados."
          actionLabel="Limpar busca"
          onAction={onClearFilter}
        />
      );
    }

    return (
      <EmptyState
        icon={Building2}
        title="Nenhuma concessionária encontrada"
        description="Cadastre sua primeira concessionária."
        actionLabel="Cadastrar concessionária"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm transition-colors">
      <div className="overflow-x-auto">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/80 bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Razão Social</TableHead>
              <TableHead className="w-[170px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">CNPJ</TableHead>
              <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cidade</TableHead>
              <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">UF</TableHead>
              <TableHead className="w-[130px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Veículos</TableHead>
              <TableHead className="text-right w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {dealers.map((dealer) => (
              <TableRow key={dealer.id} className="transition-colors hover:bg-muted/40 group">
                <TableCell className="font-semibold text-foreground py-2.5">
                  <div className="flex items-center gap-3">
                    <DealerThumbnail imageUrl={dealer.imageUrl} name={dealer.name} />
                    <span>{dealer.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs tracking-wider font-medium text-foreground/80">{dealer.cnpj}</TableCell>
                <TableCell className="text-foreground/90">{dealer.city}</TableCell>
                <TableCell className="text-muted-foreground font-medium">{dealer.state}</TableCell>
                <TableCell>
                  <Link
                    to={`/veiculos?dealerId=${dealer.id}`}
                    onClick={() => onViewVehicles?.(dealer)}
                    className="inline-flex"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="font-semibold px-2.5 py-0.5 h-7 cursor-pointer hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring gap-1 text-xs"
                      aria-label={`Ver ${dealer.totalVehicles} ${dealer.totalVehicles === 1 ? "veículo" : "veículos"} da concessionária ${dealer.name}`}
                    >
                      <span>
                        {dealer.totalVehicles} {dealer.totalVehicles === 1 ? "veículo" : "veículos"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(dealer)}
                      aria-label={`Editar concessionária ${dealer.name}`}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(dealer)}
                      aria-label={`Excluir concessionária ${dealer.name}`}
                      className="h-8 w-8 text-destructive/80 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {onPageChange && onSizeChange && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}
    </div>
  );
}
