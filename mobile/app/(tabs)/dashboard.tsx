import React, { useCallback } from 'react'
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, useTheme, ActivityIndicator, List, Divider, Chip } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { trpc } from '../../lib/trpc'

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return 'R$ 0,00'
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  return `R$ ${num.toFixed(2).replace('.', ',')}`
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export default function DashboardScreen() {
  const theme = useTheme()
  const { data, isLoading, isRefetching, refetch } = trpc.dashboard.all.useQuery()
  const lowStockQuery = trpc.products.lowStock.useQuery()

  const onRefresh = useCallback(() => {
    refetch()
    lowStockQuery.refetch()
  }, [refetch, lowStockQuery])

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const metrics = data?.metrics
  const upcoming = data?.upcomingAppointments ?? []
  const topServices = metrics?.topServices ?? []
  const topSpecialists = metrics?.topSpecialists ?? []
  const lowStockProducts = lowStockQuery.data ?? []
  const todayAppts = metrics?.appointments.today
  const completionRate = todayAppts && todayAppts.total > 0
    ? Math.round((todayAppts.completed / todayAppts.total) * 100)
    : 0

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statsRow}>
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statsContent}>
            <MaterialCommunityIcons name="cash" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {formatCurrency(metrics?.revenue.monthly)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Receita Mês
            </Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statsContent}>
            <MaterialCommunityIcons name="calendar-today" size={24} color={theme.colors.tertiary} />
            <Text variant="titleMedium" style={{ color: theme.colors.tertiary }}>
              {todayAppts?.total ?? 0}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Agendamentos Hoje
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statsContent}>
            <MaterialCommunityIcons name="ticket-outline" size={24} color={theme.colors.secondary} />
            <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>
              {formatCurrency(
                metrics?.revenue.monthly && metrics?.revenue.monthlyTransactions
                  ? metrics.revenue.monthly / metrics.revenue.monthlyTransactions
                  : null
              )}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Ticket Médio
            </Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statsContent}>
            <MaterialCommunityIcons name="check-circle-outline" size={24} color="#10b981" />
            <Text variant="titleMedium" style={{ color: '#10b981' }}>
              {completionRate}%
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Taxa Conclusão
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Gráfico de Receita
          </Text>
          <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Gráfico de Receita</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Top 5 Serviços
          </Text>
          {topServices.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Nenhum serviço</Text>
          ) : (
            topServices.slice(0, 5).map((svc, idx) => (
              <View key={svc.serviceId ?? idx}>
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
                      {idx + 1}.
                    </Text>
                    <Text style={{ color: theme.colors.onSurface }}>{svc.serviceName}</Text>
                  </View>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {svc.totalBookings}x
                  </Text>
                </View>
                {idx < Math.min(topServices.length, 5) - 1 && <Divider />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Top 5 Especialistas
          </Text>
          {topSpecialists.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Nenhum especialista</Text>
          ) : (
            topSpecialists.slice(0, 5).map((spec, idx) => (
              <View key={spec.specialistId ?? idx}>
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
                      {idx + 1}.
                    </Text>
                    <Text style={{ color: theme.colors.onSurface }}>{spec.specialistName}</Text>
                  </View>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {spec.totalAppointments}x
                  </Text>
                </View>
                {idx < Math.min(topSpecialists.length, 5) - 1 && <Divider />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Próximos Agendamentos
          </Text>
          {upcoming.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Nenhum agendamento</Text>
          ) : (
            upcoming.slice(0, 5).map((appt) => (
              <View key={appt.id}>
                <View style={styles.apptItem}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    {appt.client?.name ?? '---'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {appt.service?.name ?? '---'} - {formatDate(appt.appointmentDate)} {appt.appointmentTime}
                  </Text>
                </View>
                <Divider />
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.onErrorContainer, marginBottom: 8 }}>
              Estoque Baixo
            </Text>
            {lowStockProducts.map((prod) => (
              <View key={prod.id}>
                <View style={styles.listItem}>
                  <Text style={{ color: theme.colors.onErrorContainer, flex: 1 }}>
                    {prod.name}
                  </Text>
                  <Chip
                    style={{ backgroundColor: theme.colors.error }}
                    textStyle={{ color: theme.colors.onError }}
                  >
                    {prod.stock}/{prod.minStock}
                  </Chip>
                </View>
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
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
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 12,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  chartCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
  },
  chartPlaceholder: {
    height: 160,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apptItem: {
    paddingVertical: 10,
  },
})
