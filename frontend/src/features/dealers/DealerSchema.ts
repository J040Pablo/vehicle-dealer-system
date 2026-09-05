import { z } from 'zod';

export const dealerSchema = z.object({
  name: z.string().min(3, 'A Razão Social / Nome deve ter no mínimo 3 caracteres'),
  cnpj: z
    .string()
    .min(14, 'CNPJ incompleto')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      return clean.length === 14;
    }, 'CNPJ deve ter 14 dígitos numéricos'),
  cep: z
    .string()
    .min(8, 'CEP incompleto')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      return clean.length === 8;
    }, 'CEP deve conter 8 dígitos'),
});

export type DealerFormData = z.infer<typeof dealerSchema>;
