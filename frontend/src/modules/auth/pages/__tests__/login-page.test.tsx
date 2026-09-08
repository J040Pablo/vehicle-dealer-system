import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { LoginPage } from "../login-page";
import { useLogin } from "../../hooks/use-auth";

const mockMutateLogin = vi.fn();
const mockMutateRegister = vi.fn();

let registerCallback: (() => void) | undefined;

let mockLoginState = {
  mutate: mockMutateLogin,
  isPending: false,
  isError: false,
  error: null as Error | null,
  isSuccess: false,
  reset: vi.fn(),
};

vi.mock("../../hooks/use-auth", () => ({
  useLogin: () => mockLoginState,
  useRegister: (onSuccess?: () => void) => {
    registerCallback = onSuccess;
    return {
      mutate: mockMutateRegister,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      reset: vi.fn(),
    };
  },
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    ),
  };
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginState = {
      mutate: mockMutateLogin,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      reset: vi.fn(),
    };
  });

  it("should render login form by default", () => {
    renderComponent();

    expect(screen.getByText("Informe suas credenciais para acessar a plataforma")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite seu usuário...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua senha...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar no sistema" })).toBeInTheDocument();
  });

  it("should switch mode to registration when clicking Cadastrar tab", async () => {
    const { user } = renderComponent();

    const registerTab = screen.getByRole("button", { name: "Cadastrar" });
    await user.click(registerTab);

    expect(screen.getByText("Preencha os dados abaixo para criar sua conta")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escolha um nome de usuário...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escolha uma senha (mín. 6 caracteres)...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repita a senha escolhida...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("should submit login credentials when submitting valid login form", async () => {
    const { user } = renderComponent();

    await user.type(screen.getByPlaceholderText("Digite seu usuário..."), "admin");
    await user.type(screen.getByPlaceholderText("Digite sua senha..."), "password123");

    const submitBtn = screen.getByRole("button", { name: "Entrar no sistema" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateLogin).toHaveBeenCalledWith({
        username: "admin",
        password: "password123",
      });
    });
  });

  it("should submit registration credentials when submitting valid register form", async () => {
    const { user } = renderComponent();

    const registerTab = screen.getByRole("button", { name: "Cadastrar" });
    await user.click(registerTab);

    await user.type(screen.getByPlaceholderText("Escolha um nome de usuário..."), "newuser");
    await user.type(screen.getByPlaceholderText("Escolha uma senha (mín. 6 caracteres)..."), "secret123");
    await user.type(screen.getByPlaceholderText("Repita a senha escolhida..."), "secret123");

    const submitBtn = screen.getByRole("button", { name: "Criar conta" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateRegister).toHaveBeenCalledWith({
        username: "newuser",
        password: "secret123",
        confirmPassword: "secret123",
      });
    });
  });

  it("should switch back to login mode and show success message when register callback fires", async () => {
    const { user } = renderComponent();

    const registerTab = screen.getByRole("button", { name: "Cadastrar" });
    await user.click(registerTab);

    await user.type(screen.getByPlaceholderText("Escolha um nome de usuário..."), "registered_user");

    // Fire register success callback
    if (registerCallback) {
      registerCallback();
    }

    await waitFor(() => {
      expect(screen.getByText("Cadastro Realizado!")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Digite seu usuário...")).toHaveValue("registered_user");
    });
  });

  it("should render error alert when login mutation fails", () => {
    mockLoginState = {
      mutate: mockMutateLogin,
      isPending: false,
      isError: true,
      error: new Error("Credenciais inválidas"),
      isSuccess: false,
      reset: vi.fn(),
    };

    renderComponent();

    expect(screen.getByText("Falha na autenticação")).toBeInTheDocument();
    expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
  });

  it("should render processing alert when login mutation is pending", () => {
    mockLoginState = {
      mutate: mockMutateLogin,
      isPending: true,
      isError: false,
      error: null,
      isSuccess: false,
      reset: vi.fn(),
    };

    renderComponent();

    expect(screen.getByText("Processando")).toBeInTheDocument();
  });

  it("should render success alert when login mutation is successful", () => {
    mockLoginState = {
      mutate: mockMutateLogin,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: true,
      reset: vi.fn(),
    };

    renderComponent();

    expect(screen.getByText("Login realizado!")).toBeInTheDocument();
  });
});
