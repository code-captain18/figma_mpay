import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { apiLogin, apiUpdateUser } from "@/api";
import type { AuthUser } from "@/api";

export type { AuthUser };

const SESSION_KEY = "mpay_session";

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

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      if (stored) {
        const user: AuthUser = JSON.parse(stored);
        setState({ user, isAuthenticated: true, isLoading: false });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (username: string, password: string) => {
    const user = await apiLogin(username, password);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback(async (
    data: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>,
  ) => {
    if (!state.user) return;
    const updated = await apiUpdateUser(state.user.id, data);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(updated));
    setState((prev) => ({ ...prev, user: updated }));
  }, [state.user]);

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
