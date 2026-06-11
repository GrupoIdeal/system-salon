import React, { useState, useCallback } from 'react'
import { StyleSheet, View, FlatList, ScrollView } from 'react-native'
import { Card, Text, Chip, FAB, useTheme, ActivityIndicator, Divider } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { trpc } from '../../lib/trpc'

type StatusFilter = 'all' | 'active' | 'inactive'

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return 'R$ 0,00'
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  return `R$ ${num.toFixed(2).replace('.', ',')}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

export default function ServicosScreen() {
  const theme = useTheme()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const { data, isLoading, isRefetching, refetch } = trpc.services.list.useQuery()

  const filteredServices = (data ?? []).filter((svc) => {
    if (filter === 'all') return true
    return svc.status === filter
  })

  const renderItem = ({ item }: { item: any }) => {
    const isActive = item.status === 'active'
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
              {item.name}
            </Text>
            <Chip
              style={{
                backgroundColor: isActive ? '#10b98120' : '#ef444420',
              }}
              textStyle={{
                color: isActive ? '#10b981' : '#ef4444',
                fontSize: 12,
              }}
            >
              {isActive ? 'Ativo' : 'Inativo'}
            </Chip>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
              {formatDuration(item.duration)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="currency-usd" size={18} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.primary }]}>
              {item.priceFrom ? `a partir de ${formatCurrency(item.price)}` : formatCurrency(item.price)}
            </Text>
          </View>

          {item.description ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {item.description}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'active', 'inactive'] as StatusFilter[]).map((status) => (
          <Chip
            key={status}
            selected={filter === status}
            onPress={() => setFilter(status)}
            style={[styles.filterChip, { backgroundColor: filter === status ? theme.colors.primaryContainer : theme.colors.surface }]}
            textStyle={{
              color: filter === status ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
            }}
          >
            {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : 'Inativos'}
          </Chip>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Nenhum serviço encontrado
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
        />
      )}

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
  filterRow: {
    maxHeight: 52,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 8,
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
