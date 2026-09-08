import { http } from "@/shared/api/http";
import type { LoginCredentials, OAuth2LinkRequest, RegisterCredentials, TokenResponse, UserResponse } from "../types/auth";

export async function loginApi(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>("/auth/login", credentials);
  return response.data;
}

export async function registerApi(credentials: RegisterCredentials): Promise<UserResponse> {
  const response = await http.post<UserResponse>("/auth/register", {
    username: credentials.username,
    email: credentials.email,
    password: credentials.password,
  });
  return response.data;
}

export async function exchangeOAuth2CodeApi(code: string): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>("/auth/oauth2/exchange", { code });
  return response.data;
}

export async function linkOAuth2AccountApi(data: OAuth2LinkRequest): Promise<UserResponse> {
  const response = await http.post<UserResponse>("/auth/oauth2/link", data);
  return response.data;
}
