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
import { registerSchema } from "@shared/validations"
import Button from "../../components/ui/Button"

export default function RegisterScreen() {
  const theme = useTheme()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setErrors({})

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Senhas não conferem" })
      return
    }

    const result = registerSchema.safeParse({ name, email, password })
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
      await register(result.data.name, result.data.email, result.data.password)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar conta"
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
            Criar Conta
          </Text>

          <TextInput
            label="Nome"
            value={name}
            onChangeText={setName}
            error={!!errors.name}
            mode="outlined"
            style={styles.input}
          />
          {errors.name && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.name}
            </Text>
          )}

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

          <TextInput
            label="Confirmar Senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={!!errors.confirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
          {errors.confirmPassword && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.confirmPassword}
            </Text>
          )}

          {errors.form && (
            <Text style={[styles.formError, { color: theme.colors.error }]}>
              {errors.form}
            </Text>
          )}

          <Button
            title="Criar Conta"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            fullWidth
          />

          <View style={styles.links}>
            <Link
              href="/login"
              style={[styles.link, { color: theme.colors.primary }]}
            >
              Já tem conta? Faça login
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
    alignItems: "center",
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
})
