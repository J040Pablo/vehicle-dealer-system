import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

export const PLATE_REGEX = /^(?:[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$/;

export const vehicleSchema = z.object({
  brand: z.string().trim().min(1, "A marca do veículo é obrigatória."),
  model: z.string().trim().min(1, "O modelo do veículo é obrigatório."),
  year: z.coerce
    .number({ invalid_type_error: "Informe um ano válido." })
    .int("O ano deve ser um número inteiro.")
    .min(1900, "O ano informado é inválido.")
    .max(CURRENT_YEAR + 1, "O ano informado é inválido."),
  plate: z
    .string()
    .trim()
    .min(1, "A placa do veículo é obrigatória.")
    .regex(PLATE_REGEX, "Placa inválida. Utilize: ABC1234 ou ABC1D23"),
  color: z.string().trim().min(1, "A cor do veículo é obrigatória."),
  fuelType: z.enum(["GASOLINA", "ETANOL", "FLEX", "DIESEL", "ELETRICO", "HIBRIDO"], {
    errorMap: () => ({ message: "Selecione o tipo de combustível." }),
  }),
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
  dealerId: z.number().nullable(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const vehicleFormDefaults: VehicleFormValues = {
  brand: "",
  model: "",
  year: CURRENT_YEAR,
  plate: "",
  color: "",
  fuelType: "FLEX",
  imageUrl: "",
  dealerId: null,
};
