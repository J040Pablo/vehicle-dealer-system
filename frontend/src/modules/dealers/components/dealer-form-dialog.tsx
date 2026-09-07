import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, AlertCircle, MapPin } from "lucide-react";

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
} from "@/shared/components/ui/form";
import { maskCep, maskCnpj } from "@/shared/utils/formatters";
import { getFieldErrors } from "@/shared/api/error";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useCepLookup } from "@/shared/hooks/use-cep-lookup";
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

  const cepValue = form.watch("cep");
  const debouncedCep = useDebounce(cepValue, 400);
  const cleanCep = (debouncedCep || "").replace(/\D/g, "");
  const hasFullCep = cleanCep.length === 8;

  const {
    data: cepData,
    isLoading: isCepLoading,
    isFetching: isCepFetching,
    isError: isCepError,
    error: cepError,
    isSuccess: isCepSuccess,
  } = useCepLookup(debouncedCep);

  const isSearchingCep = isCepLoading || isCepFetching;
  const isViaCepUnavailable = isCepError && cepError?.message !== "CEP não encontrado.";
  const isCepNotFound = isCepError && cepError?.message === "CEP não encontrado.";

  useEffect(() => {
    if (!open) return;
    form.reset(
      dealer
        ? {
          name: dealer.name,
          cnpj: dealer.cnpj,
          cep: dealer.cep,
          street: dealer.street || "",
          neighborhood: dealer.neighborhood || "",
          city: dealer.city || "",
          state: dealer.state || "",
        }
        : dealerFormDefaults
    );
  }, [open, dealer, form]);

  useEffect(() => {
    if (isCepSuccess && cepData) {
      form.setValue("street", cepData.street, { shouldValidate: true, shouldDirty: true });
      form.setValue("neighborhood", cepData.neighborhood, { shouldValidate: true, shouldDirty: true });
      form.setValue("city", cepData.city, { shouldValidate: true, shouldDirty: true });
      form.setValue("state", cepData.state, { shouldValidate: true, shouldDirty: true });
      form.clearErrors("cep");
    }
  }, [isCepSuccess, cepData, form]);

  useEffect(() => {
    if (isCepNotFound) {
      form.setError("cep", {
        type: "manual",
        message: "CEP não encontrado. Verifique o número informado.",
      });
    }
  }, [isCepNotFound, form]);

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
              : "Preencha as informações abaixo para cadastrar uma nova concessionária."}
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
                    <Input placeholder="Ex: Concessionária Central Ltda." {...field} />
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
                        placeholder="00.000.000/0000-00"
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
                      <div className="relative">
                        <Input
                          placeholder="00000-000"
                          {...field}
                          onChange={(e) => field.onChange(maskCep(e.target.value))}
                          aria-describedby="cep-status"
                        />
                        {isSearchingCep && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CEP Feedback Status */}
            <div id="cep-status" aria-live="polite" role="status">
              {hasFullCep && isSearchingCep && (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium py-1 px-2 rounded-md bg-primary/5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Buscando endereço...</span>
                </div>
              )}

              {hasFullCep && isCepSuccess && cepData && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Endereço encontrado</span>
                </div>
              )}

              {isViaCepUnavailable && (
                <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-normal py-1.5 px-2.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.</span>
                </div>
              )}
            </div>

            {/* Grouped Address Section */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Endereço</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Informe o CEP para preencher automaticamente o endereço. Caso necessário, você poderá editar os campos manualmente.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Logradouro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Rua das Flores, 123"
                          className="h-9 text-xs"
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel className="text-xs">Bairro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Centro"
                          className="h-9 text-xs"
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel className="text-xs">Cidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Feira de Santana"
                          className="h-9 text-xs"
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel className="text-xs">Estado</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: BA"
                          maxLength={2}
                          className="h-9 text-xs uppercase"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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
