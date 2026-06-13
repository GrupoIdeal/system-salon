import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, getTRPCConfig } from "../lib/trpc";
import { AuthProvider } from "../hooks/useAuth";
import { getItem } from "../lib/storage";
import { STORAGE_KEYS } from "../lib/constants";
import { themeColors, darkThemeColors, fontSizes, borderRadius } from "../lib/theme";

// Create custom themes matching the front-end design system
const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: themeColors.primary,
    onPrimary: themeColors.primaryForeground,
    primaryContainer: themeColors.secondary,
    onPrimaryContainer: themeColors.secondaryForeground,
    secondary: themeColors.secondary,
    onSecondary: themeColors.secondaryForeground,
    secondaryContainer: themeColors.accent,
    onSecondaryContainer: themeColors.accentForeground,
    tertiary: themeColors.accent,
    onTertiary: themeColors.accentForeground,
    background: themeColors.background,
    onBackground: themeColors.foreground,
    surface: themeColors.surface,
    onSurface: themeColors.cardForeground,
    surfaceVariant: themeColors.surfaceVariant,
    onSurfaceVariant: themeColors.mutedForeground,
    error: themeColors.error,
    onError: themeColors.onError,
    errorContainer: themeColors.errorContainer,
    onErrorContainer: themeColors.onErrorContainer,
    outline: themeColors.outline,
    outlineVariant: themeColors.outlineVariant,
    backdrop: themeColors.muted,
    disabled: themeColors.mutedForeground,
    inverseOnSurface: themeColors.background,
    inverseSurface: themeColors.foreground,
    scrim: themeColors.black,
  },
  roundness: borderRadius.lg,
};

const darkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkThemeColors.primary,
    onPrimary: darkThemeColors.primaryForeground,
    primaryContainer: darkThemeColors.secondary,
    onPrimaryContainer: darkThemeColors.secondaryForeground,
    secondary: darkThemeColors.secondary,
    onSecondary: darkThemeColors.secondaryForeground,
    secondaryContainer: darkThemeColors.accent,
    onSecondaryContainer: darkThemeColors.accentForeground,
    tertiary: darkThemeColors.accent,
    onTertiary: darkThemeColors.accentForeground,
    background: darkThemeColors.background,
    onBackground: darkThemeColors.foreground,
    surface: darkThemeColors.surface,
    onSurface: darkThemeColors.cardForeground,
    surfaceVariant: darkThemeColors.surfaceVariant,
    onSurfaceVariant: darkThemeColors.mutedForeground,
    error: darkThemeColors.error,
    onError: darkThemeColors.onError,
    errorContainer: darkThemeColors.errorContainer,
    onErrorContainer: darkThemeColors.onErrorContainer,
    outline: darkThemeColors.outline,
    outlineVariant: darkThemeColors.outlineVariant,
    backdrop: darkThemeColors.muted,
    disabled: darkThemeColors.mutedForeground,
    inverseOnSurface: darkThemeColors.background,
    inverseSurface: darkThemeColors.foreground,
    scrim: darkThemeColors.black,
  },
  roundness: borderRadius.lg,
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
      },
    },
  }));
  const [trpcClient] = useState(() => trpc.createClient(getTRPCConfig()));
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const theme = await getItem<string>(STORAGE_KEYS.THEME_MODE);
      setIsDark(theme === "dark");
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <AuthProvider>
                <StatusBar style={isDark ? "light" : "dark"} />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="(modal)"
                    options={{ presentation: "modal" }}
                  />
                  <Stack.Screen name="empresa" />
                  <Stack.Screen name="usuarios" />
                  <Stack.Screen name="logs" />
                  <Stack.Screen name="especialistas" />
                  <Stack.Screen name="avaliacoes" />
                  <Stack.Screen name="agendamento-publico" />
                </Stack>
              </AuthProvider>
            </SafeAreaProvider>
          </PaperProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}
