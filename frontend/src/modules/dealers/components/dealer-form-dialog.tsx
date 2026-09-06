import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/components/ui/form";
import { maskCep, maskCnpj } from "@/shared/utils/formatters";
import { getFieldErrors } from "@/shared/api/error";
import {
  dealerFormDefaults,
  dealerSchema,
  type DealerFormValues,
} from "@/modules/dealers/schemas/dealer-schema";
import type { Dealer, DealerInput } from "@/modules/dealers/types/dealer";
import { useCreateDealer, useUpdateDealer } from "@/modules/dealers/hooks/use-dealer-mutations";

interface DealerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer?: Dealer | null;
}

export function DealerFormDialog({ open, onOpenChange, dealer }: DealerFormDialogProps) {
  const isEditMode = !!dealer;
  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer();
  const isPending = createDealer.isPending || updateDealer.isPending;

  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema),
    defaultValues: dealerFormDefaults,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      dealer ? { name: dealer.name, cnpj: dealer.cnpj, cep: dealer.cep } : dealerFormDefaults
    );
  }, [open, dealer, form]);

  async function onSubmit(values: DealerFormValues) {
    const input: DealerInput = { ...values };
    try {
      if (isEditMode && dealer) {
        await updateDealer.mutateAsync({ id: dealer.id, input });
      } else {
        await createDealer.mutateAsync(input);
      }
      onOpenChange(false);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof DealerFormValues, { message, type: "server" });
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar concessionária" : "Nova concessionária"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize os dados cadastrais da concessionária."
              : "O endereço é preenchido automaticamente a partir do CEP informado."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Concessionária Exemplo Ltda." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        {...field}
                        onChange={(e) => field.onChange(maskCnpj(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XXXXX-XXX"
                        {...field}
                        onChange={(e) => field.onChange(maskCep(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 pt-1 border-t border-border/50">
              <FormDescription className="text-xs text-muted-foreground">
                O endereço é buscado automaticamente via ViaCEP. Caso o serviço esteja indisponível ou o CEP não seja localizado, preencha os campos abaixo:
              </FormDescription>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Logradouro (opcional/fallback)</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua / Avenida" className="h-9 text-xs" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Bairro (opcional/fallback)</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" className="h-9 text-xs" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Cidade (opcional/fallback)</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" className="h-9 text-xs" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">UF</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" maxLength={2} className="h-9 text-xs uppercase" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
