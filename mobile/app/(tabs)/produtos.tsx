import React from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { Card, Text, FAB, useTheme, ActivityIndicator, Chip, Divider } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { trpc } from '../../lib/trpc'

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return 'R$ 0,00'
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  return `R$ ${num.toFixed(2).replace('.', ',')}`
}

export default function ProdutosScreen() {
  const theme = useTheme()
  const { data, isLoading, isRefetching, refetch } = trpc.products.list.useQuery()

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isLowStock = item.stock <= item.minStock
          return (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                    {item.name}
                  </Text>
                  {isLowStock && (
                    <Chip
                      style={{ backgroundColor: theme.colors.error }}
                      textStyle={{ color: theme.colors.onError, fontSize: 11 }}
                    >
                      Estoque Baixo
                    </Chip>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="package-variant-closed" size={18} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                    Estoque: {item.stock} / Mínimo: {item.minStock}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="currency-usd" size={18} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.primary }]}>
                    Venda: {formatCurrency(item.sellPrice)}
                  </Text>
                </View>

                {item.costPrice != null && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="currency-usd-off" size={18} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                      Custo: {formatCurrency(item.costPrice)}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )
        }}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Nenhum produto encontrado
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
