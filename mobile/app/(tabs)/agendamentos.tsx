import React, { useState, useMemo } from 'react'
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native'
import { Text, Chip, FAB, useTheme, ActivityIndicator } from 'react-native-paper'
import { trpc } from '../../lib/trpc'
import AppointmentCard from '../../components/AppointmentCard'

type ViewMode = 'daily' | 'weekly' | 'monthly'

function getDateRange(mode: ViewMode): { startDate: Date; endDate: Date } {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  if (mode === 'daily') {
    return { startDate: new Date(start), endDate: new Date(end) }
  }
  if (mode === 'weekly') {
    const dayOfWeek = start.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    start.setDate(start.getDate() - diff)
    end.setDate(start.getDate() + 6)
    return { startDate: new Date(start), endDate: new Date(end) }
  }
  start.setDate(1)
  end.setMonth(end.getMonth() + 1, 0)
  return { startDate: new Date(start), endDate: new Date(end) }
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export default function AgendamentosScreen() {
  const theme = useTheme()
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const { startDate, endDate } = useMemo(() => getDateRange(viewMode), [viewMode])

  const { data, isLoading, isRefetching, refetch } = trpc.appointments.list.useQuery({
    startDate,
    endDate,
  })

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const appt of data ?? []) {
      const key = new Date(appt.appointmentDate).toISOString().split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(appt)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [data])

  const sections = useMemo(() => {
    return grouped.map(([dateKey, items]) => ({
      title: formatDate(dateKey),
      data: items,
    }))
  }, [grouped])

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tabRow}>
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
          <Chip
            key={mode}
            selected={viewMode === mode}
            onPress={() => setViewMode(mode)}
            style={[
              styles.tabChip,
              { backgroundColor: viewMode === mode ? theme.colors.primaryContainer : theme.colors.surface },
            ]}
            textStyle={{
              color: viewMode === mode ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
            }}
          >
            {mode === 'daily' ? 'Dia' : mode === 'weekly' ? 'Semana' : 'Mês'}
          </Chip>
        ))}
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item: section }) => (
          <View>
            <Text
              variant="titleSmall"
              style={[styles.sectionHeader, { color: theme.colors.primary }]}
            >
              {section.title}
            </Text>
            {section.data.map((appt: any) => (
              <AppointmentCard
                key={appt.id}
                appointment={{
                  clientName: appt.client?.name ?? '---',
                  serviceName: appt.service?.name ?? '---',
                  specialistName: appt.specialist?.name ?? '---',
                  appointmentDate: formatDate(appt.appointmentDate),
                  appointmentTime: appt.appointmentTime,
                  status: appt.status,
                }}
              />
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Nenhum agendamento encontrado
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => {}}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    textTransform: 'capitalize',
  },
  list: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
})
