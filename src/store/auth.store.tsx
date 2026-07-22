import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "mpay_session";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: Replace with real API call
    const mockUser: AuthUser = {
      id: "1",
      name: "John Mensah",
      email,
      phone: "+233 24 123 4567",
    };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(mockUser));
    setState({ user: mockUser, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
