import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../api/auth-api";
import type { LoginCredentials, RegisterCredentials, TokenResponse, UserResponse } from "../types/auth";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation<TokenResponse, Error, LoginCredentials>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setTimeout(() => {
        navigate("/");
      }, 1000);
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
