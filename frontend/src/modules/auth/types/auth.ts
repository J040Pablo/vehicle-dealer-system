import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "O usuário é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().min(3, "O usuário deve ter no mínimo 3 caracteres"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterCredentials = z.infer<typeof registerSchema>;

export interface TokenResponse {
  token: string;
}

export interface UserResponse {
  id: number;
  username: string;
  role: string;
}
