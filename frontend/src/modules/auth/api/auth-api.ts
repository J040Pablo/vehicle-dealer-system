import { http } from "@/shared/api/http";
import type { LoginCredentials, RegisterCredentials, TokenResponse, UserResponse } from "../types/auth";

export async function loginApi(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>("/auth/login", credentials);
  return response.data;
}

export async function registerApi(credentials: RegisterCredentials): Promise<UserResponse> {
  const response = await http.post<UserResponse>("/auth/register", {
    username: credentials.username,
    password: credentials.password,
    role: "USER",
  });
  return response.data;
}
