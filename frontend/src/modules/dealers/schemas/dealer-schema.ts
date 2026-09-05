import { z } from "zod";

export const dealerSchema = z.object({
  name: z.string().trim().min(1, "A Razão Social / Nome da concessionária é obrigatório."),
  cnpj: z
    .string()
    .trim()
    .min(1, "O CNPJ é obrigatório.")
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
      "O CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou 14 dígitos numéricos."
    ),
  cep: z
    .string()
    .trim()
    .min(1, "O CEP é obrigatório.")
    .regex(/^\d{5}-?\d{3}$/, "O CEP deve estar no formato XXXXX-XXX ou 8 dígitos numéricos."),
});

export type DealerFormValues = z.infer<typeof dealerSchema>;

export const dealerFormDefaults: DealerFormValues = {
  name: "",
  cnpj: "",
  cep: "",
};
