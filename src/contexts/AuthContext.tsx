import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
}

const TOKEN_STORAGE_KEY = "bioweb_admin_token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function isSessionTokenValid(token: string | null): token is string {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(
      window.atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: unknown };
    return typeof payload.exp === "number" && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) throw new Error("Configure VITE_API_URL para acessar o painel.");
  return apiUrl.replace(/\/+$/, "");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => {
      const storedToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (isSessionTokenValid(storedToken)) return storedToken;

      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    },
  );

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let response: Response;
    try {
      response = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("Não foi possível conectar à API. Verifique se ela está ativa.");
    }

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
          ? body.error
          : `Falha ao entrar (HTTP ${response.status}).`;
      throw new Error(message);
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("token" in body) ||
      typeof body.token !== "string" ||
      !body.token
    ) {
      throw new Error("A API retornou uma resposta de login inválida.");
    }

    const loginResponse = body as LoginResponse;
    if (!isSessionTokenValid(loginResponse.token)) {
      throw new Error("A API retornou um token inválido ou expirado.");
    }
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, loginResponse.token);
    setToken(loginResponse.token);
  }, []);

  const value = useMemo(() => ({ token, login, logout }), [token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser utilizado dentro de AuthProvider.");
  }
  return context;
}
