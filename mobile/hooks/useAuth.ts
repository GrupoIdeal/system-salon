import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { router } from "expo-router";
import { trpc } from "../lib/trpc";
import { getToken, setToken, removeToken, clearAll } from "../lib/storage";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: { id: string; name: string; email: string; role: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getToken();
      if (token) {
        const result = await meQuery.refetch();
        if (result.data) {
          setUser(result.data as AuthContextType["user"]);
        } else {
          await removeToken();
        }
      }
    } catch {
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const result = await trpc.auth.login.mutate({ email, password });
    await setToken(result.token);
    setUser(result.user as AuthContextType["user"]);
    router.replace("/(tabs)/dashboard");
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await trpc.auth.register.mutate({ name, email, password });
    await setToken(result.token);
    setUser(result.user as AuthContextType["user"]);
    router.replace("/(tabs)/dashboard");
  }, []);

  const logout = useCallback(async () => {
    await clearAll();
    queryClient.clear();
    setUser(null);
    router.replace("/(auth)/login");
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
