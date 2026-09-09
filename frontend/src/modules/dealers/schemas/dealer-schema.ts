import { z } from "zod";
import { isValidCnpj } from "@/shared/utils/formatters";

export const dealerSchema = z.object({
  name: z.string().trim().min(1, "A Razão Social / Nome da concessionária é obrigatório."),
  cnpj: z
    .string()
    .trim()
    .min(1, "O CNPJ é obrigatório.")
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
      "O CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou 14 dígitos numéricos."
    )
    .refine(isValidCnpj, "CNPJ inválido (dígitos verificadores incorretos)."),
  cep: z
    .string()
    .trim()
    .min(1, "O CEP é obrigatório.")
    .regex(/^\d{5}-?\d{3}$/, "O CEP deve estar no formato XXXXX-XXX ou 8 dígitos numéricos."),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  imageUrl: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string()
      .url("URL de imagem inválida. Deve começar com http:// ou https://")
      .max(500, "A URL deve ter no máximo 500 caracteres.")
      .optional()
  ),
});

export type DealerFormValues = z.infer<typeof dealerSchema>;

export const dealerFormDefaults: DealerFormValues = {
  name: "",
  cnpj: "",
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  imageUrl: "",
};
