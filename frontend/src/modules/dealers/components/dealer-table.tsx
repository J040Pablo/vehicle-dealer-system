import { Building2, Eye, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { DealerTableSkeleton } from "@/shared/components/skeletons/dealer-table-skeleton";
import type { Dealer } from "@/modules/dealers/types/dealer";

interface DealerTableProps {
  dealers: Dealer[] | undefined;
  rawDealersCount?: number;
  isFiltered?: boolean;
  onClearFilter?: () => void;
  isLoading: boolean;
  onEdit: (dealer: Dealer) => void;
  onDelete: (dealer: Dealer) => void;
  onViewVehicles: (dealer: Dealer) => void;
  onCreate: () => void;
}

export function DealerTable({
  dealers,
  rawDealersCount = 0,
  isFiltered = false,
  onClearFilter,
  isLoading,
  onEdit,
  onDelete,
  onViewVehicles,
  onCreate,
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
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm transition-colors">
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/80 bg-muted/30">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Razão Social</TableHead>
            <TableHead className="w-[170px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">CNPJ</TableHead>
            <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cidade</TableHead>
            <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">UF</TableHead>
            <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Veículos</TableHead>
            <TableHead className="text-right w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/60">
          {dealers.map((dealer) => (
            <TableRow key={dealer.id} className="transition-colors hover:bg-muted/40 group">
              <TableCell className="font-semibold text-foreground">{dealer.name}</TableCell>
              <TableCell className="font-mono text-xs tracking-wider font-medium text-foreground/80">{dealer.cnpj}</TableCell>
              <TableCell className="text-foreground/90">{dealer.city}</TableCell>
              <TableCell className="text-muted-foreground font-medium">{dealer.state}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-semibold px-2.5 py-0.5">
                  {dealer.totalVehicles} {dealer.totalVehicles === 1 ? "veículo" : "veículos"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewVehicles(dealer)}
                    aria-label={`Ver veículos vinculados da concessionária ${dealer.name}`}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
  );
}
