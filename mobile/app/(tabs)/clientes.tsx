import React, { useState, useCallback } from 'react'
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native'
import { Searchbar, FAB, useTheme, ActivityIndicator, Text } from 'react-native-paper'
import { trpc } from '../../lib/trpc'
import ClientCard from '../../components/ClientCard'

const PAGE_SIZE = 50

export default function ClientScreen() {
  const theme = useTheme()
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const [allClients, setAllClients] = useState<any[]>([])

  const { data, isLoading, isRefetching, refetch } = trpc.clients.list.useQuery(
    { search: search || undefined, limit: PAGE_SIZE, offset },
    { onSuccess: (newData) => {
      if (offset === 0) {
        setAllClients(newData ?? [])
      } else {
        setAllClients((prev) => [...prev, ...(newData ?? [])])
      }
    }}
  )

  const hasMore = (data?.length ?? 0) >= PAGE_SIZE

  const onRefresh = useCallback(() => {
    setOffset(0)
    refetch()
  }, [refetch])

  const onEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      setOffset((prev) => prev + PAGE_SIZE)
    }
  }, [hasMore, isLoading])

  const onSearchChange = useCallback((text: string) => {
    setSearch(text)
    setOffset(0)
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Buscar clientes..."
        onChangeText={onSearchChange}
        value={search}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
      />

      {isLoading && offset === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={allClients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientCard
              client={{
                name: item.name,
                phone: item.phone ?? '',
                email: item.email ?? '',
                loyaltyPoints: item.loyaltyPoints ?? 0,
                photo: item.photo,
              }}
            />
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Nenhum cliente encontrado
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
  searchBar: {
    margin: 12,
    borderRadius: 12,
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
