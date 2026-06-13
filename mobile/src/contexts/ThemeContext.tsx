import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors, ColorsDark, ColorsHighContrast } from '@/utils/colors';

type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  colors: typeof Colors;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@salon:theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
      if (savedTheme && ['light', 'dark', 'high-contrast', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    await SecureStore.setItemAsync(THEME_KEY, newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Determinar o tema atual
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const isHighContrast = theme === 'high-contrast';

  // Selecionar paleta de cores
  const colors = isHighContrast 
    ? ColorsHighContrast 
    : isDark 
      ? ColorsDark 
      : Colors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
