import { z } from 'zod';

export const vehicleSchema = z.object({
  brand: z.string().min(2, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z
    .number({ invalid_type_error: 'Ano deve ser um número' })
    .min(1900, 'Ano inválido')
    .max(new Date().getFullYear() + 2, 'Ano inválido'),
  plate: z.string().min(7, 'Placa deve ter no mínimo 7 caracteres'),
  fuelType: z.enum(['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'ELETRICO', 'HIBRIDO'], {
    required_error: 'Tipo de combustível é obrigatório',
  }),
  dealerId: z.number().nullable().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
