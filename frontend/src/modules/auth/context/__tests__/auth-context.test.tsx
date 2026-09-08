import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../auth-context";

function createMockJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout, token } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="auth">{isAuthenticated ? "authenticated" : "unauthenticated"}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
      <span data-testid="role">{user?.role ?? "none"}</span>
      <span data-testid="token">{token ?? "none"}</span>
      <button onClick={() => login(createMockJwt({ sub: "admin", role: "ADMIN" }))}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext & AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize as unauthenticated when localStorage is empty", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    expect(screen.getByTestId("auth")).toHaveTextContent("unauthenticated");
    expect(screen.getByTestId("username")).toHaveTextContent("none");
  });

  it("should initialize with user session if localStorage contains valid valid token", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour ahead
    const validToken = createMockJwt({ sub: "john_doe", role: "MANAGER", exp: futureExp });
    localStorage.setItem("token", validToken);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("username")).toHaveTextContent("john_doe");
    expect(screen.getByTestId("role")).toHaveTextContent("MANAGER");
  });

  it("should clear token and user state if stored token is expired", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const expiredToken = createMockJwt({ sub: "john_doe", exp: pastExp });
    localStorage.setItem("token", expiredToken);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth")).toHaveTextContent("unauthenticated");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should clear token if stored token payload is invalid JSON", () => {
    localStorage.setItem("token", "invalid.token.payload");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth")).toHaveTextContent("unauthenticated");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should update state and localStorage upon login and clear state upon logout", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText("Login"));

    expect(screen.getByTestId("auth")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("username")).toHaveTextContent("admin");
    expect(screen.getByTestId("role")).toHaveTextContent("ADMIN");
    expect(localStorage.getItem("token")).not.toBeNull();

    await user.click(screen.getByText("Logout"));

    expect(screen.getByTestId("auth")).toHaveTextContent("unauthenticated");
    expect(screen.getByTestId("username")).toHaveTextContent("none");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should throw an error when useAuth is consumed outside AuthProvider", () => {
    // Suppress expected console.error during error boundary test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow("useAuth deve ser utilizado dentro de um AuthProvider");

    consoleSpy.mockRestore();
  });
});
