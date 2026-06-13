import { useEffect, useState } from "react"
import { Stack, router } from "expo-router"
import { useAuth } from "../../hooks/useAuth"
import { publicTrpc, getPublicTRPCConfig } from "../../lib/public-trpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ActivityIndicator, View } from "react-native"

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const [queryClient] = useState(() => new QueryClient())
  const [publicTrpcClient] = useState(() => publicTrpc.createClient(getPublicTRPCConfig()))

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)/dashboard")
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <publicTrpc.Provider client={publicTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </publicTrpc.Provider>
  )
}
