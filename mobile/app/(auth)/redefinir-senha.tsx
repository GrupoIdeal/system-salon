import { useState } from "react"
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"
import { Text, TextInput, useTheme } from "react-native-paper"
import { Link, useLocalSearchParams } from "expo-router"
import { passwordResetSchema } from "@shared/validations"
import { publicTrpc } from "../../lib/public-trpc"
import Button from "../../components/ui/Button"

export default function RedefinirSenhaScreen() {
  const theme = useTheme()
  const { token } = useLocalSearchParams<{ token: string }>()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const { mutateAsync: resetPassword, isPending } =
    publicTrpc.auth.resetPassword.useMutation()

  async function handleSubmit() {
    setErrors({})

    if (!token) {
      setErrors({ form: "Token de redefinição inválido" })
      return
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Senhas não conferem" })
      return
    }

    const result = passwordResetSchema.safeParse({ token, password })
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

    try {
      await resetPassword({
        token: result.data.token,
        password: result.data.password,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao redefinir senha"
      setErrors({ form: message })
    }
  }

  if (success) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Senha Redefinida!
        </Text>
        <Text style={styles.message}>
          Sua senha foi redefinida com sucesso.
        </Text>
        <Link
          href="/login"
          style={[styles.link, { color: theme.colors.primary, marginTop: 24 }]}
        >
          Voltar para o login
        </Link>
      </View>
    )
  }

  if (!token) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.title, { color: theme.colors.error }]}>
          Link Inválido
        </Text>
        <Text style={styles.message}>
          O link de redefinição de senha é inválido ou expirou.
        </Text>
        <Link
          href="/recuperar-senha"
          style={[styles.link, { color: theme.colors.primary, marginTop: 24 }]}
        >
          Solicitar novo link
        </Link>
      </View>
    )
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
            Redefinir Senha
          </Text>
          <Text style={styles.description}>
            Digite sua nova senha.
          </Text>

          <TextInput
            label="Nova Senha"
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
            label="Confirmar Nova Senha"
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
            title="Redefinir Senha"
            onPress={handleSubmit}
            loading={isPending}
            disabled={isPending}
            fullWidth
          />

          <View style={styles.links}>
            <Link
              href="/login"
              style={[styles.link, { color: theme.colors.primary }]}
            >
              Voltar para o login
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    marginTop: 16,
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
