import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { axiosInstance } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'specialist' | 'client';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@salon:user_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEY);
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Buscar dados do usuário
        const response = await axiosInstance.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;
    
    await SecureStore.setItemAsync(STORAGE_KEY, token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password,
      phone,
    });
    const { token, user: userData } = response.data;
    
    await SecureStore.setItemAsync(STORAGE_KEY, token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
