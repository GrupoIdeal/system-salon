import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, getTRPCConfig } from "../lib/trpc";
import { AuthProvider } from "../hooks/useAuth";
import { getItem } from "../lib/storage";
import { STORAGE_KEYS } from "../lib/constants";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6366f1",
    secondary: "#a78bfa",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#818cf8",
    secondary: "#c4b5fd",
  },
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient(getTRPCConfig()));
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    const theme = await getItem<string>(STORAGE_KEYS.THEME_MODE);
    setIsDark(theme === "dark");
  }

  const theme = isDark ? darkTheme : lightTheme;

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
