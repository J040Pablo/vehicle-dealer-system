import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OAuth2RedirectPage } from "../oauth2-redirect-page";
import * as useAuthModule from "../../hooks/use-auth";

vi.mock("../../hooks/use-auth", () => ({
  useExchangeOAuth2Code: vi.fn(),
}));

describe("OAuth2RedirectPage", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state while exchange mutation is pending", () => {
    vi.mocked(useAuthModule.useExchangeOAuth2Code).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter initialEntries={["/oauth2/redirect?code=sample_code"]}>
        <OAuth2RedirectPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Validando seu código de acesso...")).toBeInTheDocument();
  });

  it("should trigger exchange code mutation when code is present in URL", () => {
    vi.mocked(useAuthModule.useExchangeOAuth2Code).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter initialEntries={["/oauth2/redirect?code=sample_code"]}>
        <OAuth2RedirectPage />
      </MemoryRouter>
    );

    expect(mockMutate).toHaveBeenCalledWith("sample_code");
  });

  it("should display error message when URL contains error query param", () => {
    vi.mocked(useAuthModule.useExchangeOAuth2Code).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter initialEntries={["/oauth2/redirect?error=access_denied"]}>
        <OAuth2RedirectPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Falha na Autenticação Google")).toBeInTheDocument();
    expect(screen.getByText(/Erro retornado pelo Google: access_denied/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voltar para a página de Login/i })).toBeInTheDocument();
  });

  it("should display success state when exchange mutation succeeds", () => {
    vi.mocked(useAuthModule.useExchangeOAuth2Code).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter initialEntries={["/oauth2/redirect?code=sample_code"]}>
        <OAuth2RedirectPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Autenticado com sucesso!")).toBeInTheDocument();
  });
});
