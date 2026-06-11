import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text, useTheme, Button as PaperButton, TextInput } from 'react-native-paper'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { publicTrpc } from '../../lib/public-trpc'

export default function AvaliacaoScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const theme = useTheme()

  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')

  const ratingQuery = publicTrpc.ratings.getByToken.useQuery(
    { token: token ?? '' },
    { enabled: !!token }
  )
  const submitMutation = publicTrpc.ratings.submit.useMutation()

  const handleSubmit = async () => {
    if (!token || stars === 0) return
    try {
      await submitMutation.mutateAsync({
        token,
        stars,
        comment: comment.trim() || undefined,
      })
      router.back()
    } catch {
      // handled by mutation
    }
  }

  if (ratingQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (ratingQuery.isError || !ratingQuery.data) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>Link de avaliação inválido ou expirado</Text>
      </SafeAreaView>
    )
  }

  const rating = ratingQuery.data
  const clientName = rating.clientName ?? 'Cliente'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>Avalie o Atendimento</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {clientName}, como foi sua experiência?
          </Text>
        </View>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => {
            const filled = star <= stars
            return (
              <TouchableOpacity
                key={star}
                onPress={() => setStars(star === stars && star === 1 ? 0 : star)}
                accessibilityLabel={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                style={styles.starButton}
              >
                <Text
                  style={[
                    styles.star,
                    { color: filled ? '#FFB300' : theme.colors.surfaceDisabled },
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {stars > 0 && (
          <Text variant="bodySmall" style={styles.starLabel}>
            {stars === 1 && 'Muito ruim'}
            {stars === 2 && 'Ruim'}
            {stars === 3 && 'Bom'}
            {stars === 4 && 'Muito bom'}
            {stars === 5 && 'Excelente'}
          </Text>
        )}

        <TextInput
          label="Comentário (opcional)"
          value={comment}
          onChangeText={setComment}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.commentInput}
        />

        <View style={styles.infoBox}>
          <Text variant="bodySmall" style={styles.infoText}>
            Sua avaliação é anônima e ajuda a melhorar nossos serviços.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PaperButton
          mode="contained"
          onPress={handleSubmit}
          loading={submitMutation.isPending}
          disabled={stars === 0 || submitMutation.isPending}
          style={styles.submitButton}
        >
          Enviar Avaliação
        </PaperButton>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#b71c1c',
    fontSize: 16,
    textAlign: 'center',
    padding: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 48,
  },
  starLabel: {
    marginBottom: 24,
    fontSize: 16,
  },
  commentInput: {
    width: '100%',
    marginBottom: 16,
  },
  infoBox: {
    paddingHorizontal: 16,
  },
  infoText: {
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    width: '100%',
  },
  submitButton: {
    width: '100%',
    minHeight: 48,
  },
})
