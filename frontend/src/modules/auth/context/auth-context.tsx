import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        // Extrai payload do JWT de forma segura (sem dependência extra)
        const payloadBase64 = savedToken.split(".")[1];
        if (payloadBase64) {
          const decodedJson = atob(payloadBase64);
          const payload = JSON.parse(decodedJson);
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            // Token expirado
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          } else {
            setUser({
              username: payload.sub || "Usuário",
              role: payload.role || "USER",
            });
          }
        }
      } catch {
        // Se houver falha de parse, limpa o token inválido
        localStorage.removeItem("token");
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const payloadBase64 = newToken.split(".")[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64));
        setUser({
          username: payload.sub || "Usuário",
          role: payload.role || "USER",
        });
      }
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
