import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog";
import { useDeleteDealer } from "@/modules/dealers/hooks/use-dealer-mutations";
import type { Dealer } from "@/modules/dealers/types/dealer";

interface DeleteDealerDialogProps {
  dealer: Dealer | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDealerDialog({ dealer, onOpenChange }: DeleteDealerDialogProps) {
  const deleteDealer = useDeleteDealer();

  return (
    <ConfirmDeleteDialog
      open={!!dealer}
      onOpenChange={onOpenChange}
      title="Excluir concessionária"
      description={
        dealer
          ? `Tem certeza que deseja excluir "${dealer.name}"? Esta ação não pode ser desfeita.`
          : ""
      }
      isPending={deleteDealer.isPending}
      onConfirm={() => {
        if (!dealer) return;
        deleteDealer.mutate(dealer.id, {
          onSuccess: () => onOpenChange(false),
        });
      }}
    />
  );
}
