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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import type { Dealer } from "@/modules/dealers/types/dealer";

interface DealerTableProps {
  dealers: Dealer[] | undefined;
  isLoading: boolean;
  onEdit: (dealer: Dealer) => void;
  onDelete: (dealer: Dealer) => void;
  onViewVehicles: (dealer: Dealer) => void;
  onCreate: () => void;
}

export function DealerTable({
  dealers,
  isLoading,
  onEdit,
  onDelete,
  onViewVehicles,
  onCreate,
}: DealerTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!dealers || dealers.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhuma concessionária cadastrada"
        description="Cadastre a primeira concessionária para começar a vincular veículos."
        actionLabel="Nova concessionária"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Razão Social</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Veículos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dealers.map((dealer) => (
            <TableRow key={dealer.id}>
              <TableCell className="font-medium">{dealer.name}</TableCell>
              <TableCell className="font-mono text-xs">{dealer.cnpj}</TableCell>
              <TableCell>{dealer.city}</TableCell>
              <TableCell>{dealer.state}</TableCell>
              <TableCell>
                <Badge variant="secondary">{dealer.totalVehicles}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewVehicles(dealer)}
                    aria-label="Ver veículos vinculados"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(dealer)} aria-label="Editar concessionária">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(dealer)}
                    aria-label="Excluir concessionária"
                    className="text-destructive hover:text-destructive"
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
