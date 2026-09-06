import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../api/auth-api";
import type { LoginCredentials, RegisterCredentials, TokenResponse, UserResponse } from "../types/auth";
import { useAuth } from "../context/auth-context";

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation<TokenResponse, Error, LoginCredentials>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (data.token) {
        login(data.token);
      }
      setTimeout(() => {
        navigate("/");
      }, 500);
    },
  });
}

export function useRegister(onRegisterSuccess?: () => void) {
  return useMutation<UserResponse, Error, RegisterCredentials>({
    mutationFn: registerApi,
    onSuccess: () => {
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    },
  });
}
