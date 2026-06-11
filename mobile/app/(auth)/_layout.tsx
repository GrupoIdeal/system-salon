import { useEffect } from "react"
import { Stack, router } from "expo-router"
import { useAuth } from "../../hooks/useAuth"
import { ActivityIndicator, View } from "react-native"

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

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

  return <Stack screenOptions={{ headerShown: false }} />
}
