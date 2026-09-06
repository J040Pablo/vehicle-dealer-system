import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

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
    .transform((value) => value.toUpperCase()),
  color: z.string().trim().min(1, "A cor do veículo é obrigatória."),
  fuelType: z.enum(["GASOLINA", "ETANOL", "FLEX", "DIESEL", "ELETRICO", "HIBRIDO"], {
    errorMap: () => ({ message: "Selecione o tipo de combustível." }),
  }),
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
  dealerId: null,
};
