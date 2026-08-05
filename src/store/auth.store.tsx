import type { AuthUser } from "@/api";
import { apiLogin, apiLogout, apiRefreshSession, apiUpdateUser } from "@/api";
import { setLogoutHandler } from "@/api/client";
import { clearTokens, getRefreshToken, setTokens } from "@/utils/tokenStorage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const performLogout = useCallback(async () => {
    await clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  useEffect(() => {
    setLogoutHandler(performLogout);
  }, [performLogout]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refresh = await getRefreshToken();
        if (refresh) {
          const { user, accessToken, refreshToken } = await apiRefreshSession(refresh);
          await setTokens(accessToken, refreshToken);
          setState({ user, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch {
        await clearTokens();
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };
    restoreSession();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { user, accessToken, refreshToken } = await apiLogin(username, password);
    await setTokens(accessToken, refreshToken);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    const refresh = await getRefreshToken();
    if (refresh) apiLogout(refresh);
    await performLogout();
  }, [performLogout]);

  const updateUser = useCallback(async (
    data: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>,
  ) => {
    const updated = await apiUpdateUser(data);
    setState(prev => ({ ...prev, user: updated }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
