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
import { passwordResetRequestSchema } from "@shared/validations"
import { publicTrpc } from "../../lib/public-trpc"
import Button from "../../components/ui/Button"

export default function RecuperarSenhaScreen() {
  const theme = useTheme()
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const { mutateAsync: requestReset, isPending } =
    publicTrpc.auth.requestPasswordReset.useMutation()

  async function handleSubmit() {
    setErrors({})
    const result = passwordResetRequestSchema.safeParse({ email })
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
      await requestReset({ email: result.data.email })
      setSent(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao solicitar redefinição"
      setErrors({ form: message })
    }
  }

  if (sent) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Email enviado!
        </Text>
        <Text style={styles.message}>
          Se o email informado estiver cadastrado, você receberá um link para
          redefinir sua senha.
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
            Recuperar Senha
          </Text>
          <Text style={styles.description}>
            Digite seu email cadastrado e enviaremos um link para redefinir sua
            senha.
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

          {errors.form && (
            <Text style={[styles.formError, { color: theme.colors.error }]}>
              {errors.form}
            </Text>
          )}

          <Button
            title="Enviar link"
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
