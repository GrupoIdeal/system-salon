import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text, useTheme, Button as PaperButton, Avatar } from 'react-native-paper'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { trpc } from '../../lib/trpc'
import TextInput from '../../components/ui/TextInput'

export default function PerfilClienteScreen() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>()
  const theme = useTheme()

  const clientQuery = trpc.clients.get.useQuery({ id: clientId ?? '' }, { enabled: !!clientId })
  const updateClient = trpc.clients.update.useMutation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (clientQuery.data) {
      setName(clientQuery.data.name ?? '')
      setEmail(clientQuery.data.email ?? '')
      setPhone(clientQuery.data.phone ?? '')
      setBirthDate(
        clientQuery.data.birthDate
          ? new Date(clientQuery.data.birthDate).toISOString().split('T')[0]
          : ''
      )
      setNotes(clientQuery.data.notes ?? '')
      setPhoto(clientQuery.data.photo ?? '')
    }
  }, [clientQuery.data])

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled && result.assets[0]?.base64) {
      setPhotoLoading(true)
      try {
        const uploadResult = await trpc.images.upload.mutate({
          base64: result.assets[0].base64,
        })
        setPhoto(uploadResult.url)
      } catch {
        // handle upload error
      } finally {
        setPhotoLoading(false)
      }
    }
  }

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled && result.assets[0]?.base64) {
      setPhotoLoading(true)
      try {
        const uploadResult = await trpc.images.upload.mutate({
          base64: result.assets[0].base64,
        })
        setPhoto(uploadResult.url)
      } catch {
        // handle upload error
      } finally {
        setPhotoLoading(false)
      }
    }
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    try {
      const birthDateObj = birthDate ? new Date(birthDate + 'T12:00:00.000Z') : undefined
      await updateClient.mutateAsync({
        id: clientId,
        data: {
          name,
          email: email || undefined,
          phone: phone || undefined,
          birthDate: birthDateObj,
          notes: notes || undefined,
          photo: photo || undefined,
        },
      })
      router.back()
    } catch {
      // handled by mutation
    } finally {
      setSaving(false)
    }
  }

  if (clientQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (clientQuery.isError) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>Erro ao carregar dados do cliente</Text>
      </SafeAreaView>
    )
  }

  const client = clientQuery.data
  const loyaltyPoints = client?.loyaltyPoints ?? 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handlePickImage} onLongPress={handleTakePhoto} accessibilityLabel="Alterar foto do cliente">
            {photoLoading ? (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.surfaceDisabled }]}>
                <ActivityIndicator size="large" />
              </View>
            ) : photo ? (
              <Avatar.Image source={{ uri: photo }} size={96} />
            ) : (
              <Avatar.Text
                label={name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'}
                size={96}
                color={theme.colors.onPrimaryContainer}
              />
            )}
          </TouchableOpacity>
          <Text variant="bodySmall" style={styles.photoHint}>Toque para escolher foto</Text>
        </View>

        <View style={[styles.loyaltyCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>Pontos de Fidelidade</Text>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            {loyaltyPoints}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Nome"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Data de Nascimento"
            value={birthDate}
            onChangeText={setBirthDate}
          />
          <TextInput
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PaperButton
          mode="contained"
          onPress={handleSave}
          loading={saving || updateClient.isPending}
          disabled={saving || updateClient.isPending}
          style={styles.saveButton}
        >
          Salvar
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    marginTop: 8,
    opacity: 0.6,
  },
  loyaltyCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  form: {
    gap: 4,
  },
  footer: {
    padding: 16,
  },
  saveButton: {
    width: '100%',
    minHeight: 48,
  },
})
