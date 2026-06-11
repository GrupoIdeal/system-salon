import { useState } from "react"
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"
import { Text, TextInput, useTheme } from "react-native-paper"
import { Link } from "expo-router"
import { useAuth } from "../../hooks/useAuth"
import { loginSchema } from "@shared/validations"
import Button from "../../components/ui/Button"

export default function LoginScreen() {
  const theme = useTheme()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setErrors({})
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = String(issue.path[0])
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    try {
      await login(result.data.email, result.data.password)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao fazer login"
      setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Entrar
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={!!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />
          {errors.email && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.email}
            </Text>
          )}

          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            error={!!errors.password}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
          {errors.password && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.password}
            </Text>
          )}

          {errors.form && (
            <Text style={[styles.formError, { color: theme.colors.error }]}>
              {errors.form}
            </Text>
          )}

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            fullWidth
          />

          <View style={styles.links}>
            <Link
              href="/recuperar-senha"
              style={[styles.link, { color: theme.colors.primary }]}
            >
              Esqueceu sua senha?
            </Link>
            <Link
              href="/register"
              style={[styles.link, { color: theme.colors.primary }]}
            >
              Criar conta
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  form: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginTop: 8,
  },
  error: {
    fontSize: 12,
    marginLeft: 4,
  },
  formError: {
    textAlign: "center",
    marginTop: 8,
  },
  links: {
    marginTop: 24,
    gap: 12,
    alignItems: "center",
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
})
