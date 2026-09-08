import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useLogin, useRegister } from "../use-auth";
import * as authApi from "../../api/auth-api";
import { AuthProvider } from "../../context/auth-context";

vi.mock("../../api/auth-api", () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("Auth Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("useLogin", () => {
    it("should call loginApi and navigate on successful login", async () => {
      const mockToken = "mock.jwt.token";
      vi.mocked(authApi.loginApi).mockResolvedValueOnce({ token: mockToken });

      const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({ username: "user", password: "password" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authApi.loginApi).toHaveBeenCalledWith(
        expect.objectContaining({ username: "user", password: "password" }),
        expect.anything()
      );

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/");
        },
        { timeout: 1500 }
      );
    });
  });

  describe("useRegister", () => {
    it("should call registerApi and execute onRegisterSuccess callback", async () => {
      const onRegisterSuccess = vi.fn();
      vi.mocked(authApi.registerApi).mockResolvedValueOnce({ id: 1, username: "newuser", role: "USER" });

      const { result } = renderHook(() => useRegister(onRegisterSuccess), { wrapper: createWrapper() });

      act(() => {
        result.current.mutate({ username: "newuser", password: "password", confirmPassword: "password" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authApi.registerApi).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "newuser",
          password: "password",
          confirmPassword: "password",
        }),
        expect.anything()
      );
      expect(onRegisterSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
