import React, { useState, useMemo } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text, useTheme, Button as PaperButton, SegmentedButtons } from 'react-native-paper'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '../../lib/trpc'
import { addDays, format, isPast, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type SelectionState = {
  service: { id: string; name: string; price: string; duration: number } | null
  specialist: { id: string; name: string } | null
  date: Date | null
  time: string | null
}

const INITIAL_SELECTION: SelectionState = {
  service: null,
  specialist: null,
  date: null,
  time: null,
}

const STEPS = ['Serviço', 'Profissional', 'Data', 'Horário', 'Revisão']

export default function NovoAgendamentoScreen() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>()
  const theme = useTheme()

  const [currentStep, setCurrentStep] = useState(0)
  const [selection, setSelection] = useState<SelectionState>(INITIAL_SELECTION)

  const servicesQuery = trpc.services.list.useQuery()
  const specialistsQuery = trpc.specialists.list.useQuery()
  const availableSlotsQuery = trpc.appointments.getAvailableSlots.useQuery(
    {
      specialistId: selection.specialist?.id ?? '',
      serviceId: selection.service?.id ?? '',
      date: selection.date ?? new Date(),
    },
    { enabled: !!selection.specialist && !!selection.service && !!selection.date }
  )
  const createAppointment = trpc.appointments.create.useMutation()

  const days = useMemo(() => {
    const result: Date[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      result.push(addDays(today, i))
    }
    return result
  }, [])

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selection.service
      case 1: return !!selection.specialist
      case 2: return !!selection.date
      case 3: return !!selection.time
      default: return false
    }
  }

  const handleSelectService = (service: SelectionState['service']) => {
    setSelection(prev => ({ ...prev, service, specialist: null, date: null, time: null }))
  }

  const handleSelectSpecialist = (specialist: SelectionState['specialist']) => {
    setSelection(prev => ({ ...prev, specialist, date: null, time: null }))
  }

  const handleSelectDate = (date: Date) => {
    setSelection(prev => ({ ...prev, date, time: null }))
  }

  const handleConfirm = async () => {
    if (!selection.service || !selection.specialist || !selection.date || !selection.time || !clientId) return

    try {
      await createAppointment.mutateAsync({
        clientId,
        serviceId: selection.service.id,
        specialistId: selection.specialist.id,
        appointmentDate: selection.date,
        appointmentTime: selection.time,
      })
      router.back()
    } catch {
      // error state handled by mutation
    }
  }

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((label, idx) => (
        <React.Fragment key={label}>
          <View style={styles.stepDotContainer}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    idx <= currentStep ? theme.colors.primary : theme.colors.surfaceDisabled,
                },
              ]}
            >
              <Text style={[styles.stepDotText, { color: idx <= currentStep ? '#fff' : theme.colors.onSurfaceDisabled }]}>
                {idx + 1}
              </Text>
            </View>
            <Text style={[styles.stepLabel, { color: idx === currentStep ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
              {label}
            </Text>
          </View>
          {idx < STEPS.length - 1 && (
            <View style={[styles.stepLine, { backgroundColor: idx < currentStep ? theme.colors.primary : theme.colors.surfaceDisabled }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderServiceStep()
      case 1:
        return renderSpecialistStep()
      case 2:
        return renderDateStep()
      case 3:
        return renderTimeStep()
      case 4:
        return renderReviewStep()
      default:
        return null
    }
  }

  const renderServiceStep = () => {
    if (servicesQuery.isLoading) {
      return <ActivityIndicator size="large" style={styles.centered} />
    }
    if (servicesQuery.isError) {
      return <Text style={styles.errorText}>Erro ao carregar serviços</Text>
    }

    const services = servicesQuery.data ?? []

    return (
      <ScrollView style={styles.stepContent}>
        <Text variant="titleLarge" style={styles.stepTitle}>Selecione o Serviço</Text>
        {services.map(service => {
          const selected = selection.service?.id === service.id
          return (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.outline,
                },
              ]}
              onPress={() => handleSelectService({ id: service.id, name: service.name, price: String(service.price), duration: service.duration })}
              accessibilityLabel={`Selecionar serviço ${service.name}`}
            >
              <View style={styles.itemRow}>
                <Text variant="titleMedium" style={styles.itemName}>{service.name}</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  R$ {String(service.price)}
                </Text>
              </View>
              {service.description ? (
                <Text variant="bodySmall" style={styles.itemDescription}>{service.description}</Text>
              ) : null}
              <Text variant="bodySmall">{service.duration} min</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  const renderSpecialistStep = () => {
    if (specialistsQuery.isLoading) {
      return <ActivityIndicator size="large" style={styles.centered} />
    }
    if (specialistsQuery.isError) {
      return <Text style={styles.errorText}>Erro ao carregar profissionais</Text>
    }

    const specialists = specialistsQuery.data ?? []

    return (
      <ScrollView style={styles.stepContent}>
        <Text variant="titleLarge" style={styles.stepTitle}>Selecione o Profissional</Text>
        {specialists.map(specialist => {
          const selected = selection.specialist?.id === specialist.id
          return (
            <TouchableOpacity
              key={specialist.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.outline,
                },
              ]}
              onPress={() => handleSelectSpecialist({ id: specialist.id, name: specialist.name })}
              accessibilityLabel={`Selecionar profissional ${specialist.name}`}
            >
              <Text variant="titleMedium" style={styles.itemName}>{specialist.name}</Text>
              {specialist.specialty ? (
                <Text variant="bodySmall">{specialist.specialty}</Text>
              ) : null}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  const renderDateStep = () => (
    <View style={styles.stepContent}>
      <Text variant="titleLarge" style={styles.stepTitle}>Selecione a Data</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
        {days.map(day => {
          const isSelected = selection.date && startOfDay(selection.date).getTime() === startOfDay(day).getTime()
          const isDayPast = isPast(startOfDay(day)) && startOfDay(day).getTime() !== startOfDay(new Date()).getTime()
          const dayName = format(day, 'EEE', { locale: ptBR }).slice(0, 3)
          const dayNumber = format(day, 'd')

          return (
            <TouchableOpacity
              key={day.toISOString()}
              disabled={isDayPast}
              style={[
                styles.dayCard,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                  opacity: isDayPast ? 0.4 : 1,
                },
              ]}
              onPress={() => handleSelectDate(day)}
              accessibilityLabel={`Selecionar data ${format(day, 'dd/MM/yyyy')}`}
            >
              <Text style={[styles.dayName, { color: isSelected ? '#fff' : theme.colors.onSurfaceVariant }]}>
                {dayName}
              </Text>
              <Text style={[styles.dayNumber, { color: isSelected ? '#fff' : theme.colors.onSurface }]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )

  const renderTimeStep = () => {
    if (availableSlotsQuery.isLoading) {
      return <ActivityIndicator size="large" style={styles.centered} />
    }
    if (availableSlotsQuery.isError) {
      return <Text style={styles.errorText}>Erro ao carregar horários</Text>
    }

    const slots = availableSlotsQuery.data ?? []

    return (
      <View style={styles.stepContent}>
        <Text variant="titleLarge" style={styles.stepTitle}>Selecione o Horário</Text>
        {slots.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum horário disponível para esta data</Text>
        ) : (
          <View style={styles.slotsGrid}>
            {slots.map(slot => {
              const isSelected = selection.time === slot
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotButton,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                    },
                  ]}
                  onPress={() => setSelection(prev => ({ ...prev, time: slot }))}
                  accessibilityLabel={`Selecionar horário ${slot}`}
                >
                  <Text style={{ color: isSelected ? '#fff' : theme.colors.onSurface }}>{slot}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </View>
    )
  }

  const renderReviewStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text variant="titleLarge" style={styles.stepTitle}>Revisar Agendamento</Text>
      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text variant="labelMedium" style={styles.reviewLabel}>Serviço</Text>
          <Text variant="bodyLarge">{selection.service?.name}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text variant="labelMedium" style={styles.reviewLabel}>Profissional</Text>
          <Text variant="bodyLarge">{selection.specialist?.name}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text variant="labelMedium" style={styles.reviewLabel}>Data</Text>
          <Text variant="bodyLarge">
            {selection.date ? format(selection.date, 'dd/MM/yyyy', { locale: ptBR }) : ''}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Text variant="labelMedium" style={styles.reviewLabel}>Horário</Text>
          <Text variant="bodyLarge">{selection.time}</Text>
        </View>
        <View style={[styles.reviewRow, { borderBottomWidth: 0 }]}>
          <Text variant="labelMedium" style={styles.reviewLabel}>Valor</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            R$ {selection.service?.price ?? '0,00'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderStepIndicator()}
      <View style={styles.body}>
        {renderStepContent()}
      </View>
      <View style={styles.footer}>
        {currentStep > 0 && (
          <PaperButton
            mode="outlined"
            onPress={() => setCurrentStep(prev => prev - 1)}
            style={styles.footerButton}
          >
            Anterior
          </PaperButton>
        )}
        {currentStep < STEPS.length - 1 ? (
          <PaperButton
            mode="contained"
            onPress={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            style={styles.footerButton}
          >
            Próximo
          </PaperButton>
        ) : (
          <PaperButton
            mode="contained"
            onPress={handleConfirm}
            loading={createAppointment.isPending}
            disabled={!canProceed() || createAppointment.isPending}
            style={styles.footerButton}
          >
            Confirmar Agendamento
          </PaperButton>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  stepDotContainer: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 18,
  },
  body: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#b71c1c',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#757575',
  },
  itemCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontWeight: '600',
  },
  itemDescription: {
    marginTop: 4,
  },
  daysContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  dayCard: {
    width: 64,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dayName: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  reviewCard: {
    borderRadius: 8,
    padding: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewLabel: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
})
