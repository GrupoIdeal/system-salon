import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  useTheme,
  List,
  Searchbar,
  Chip,
} from "react-native-paper";
import { trpc } from "../lib/trpc";
import EmptyState from "../components/EmptyState";

const ACTION_COLORS: Record<string, string> = {
  create: "#4CAF50",
  update: "#FF9800",
  delete: "#F44336",
  login: "#2196F3",
  logout: "#9E9E9E",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Criou",
  update: "Editou",
  delete: "Removeu",
  login: "Login",
  logout: "Logout",
};

export default function LogsScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [allLogs, setAllLogs] = useState<Array<Record<string, unknown>>>([]);

  const { data, isLoading, isError, refetch, isFetching } = trpc.audit.list.useQuery(
    { limit: 50, offset },
    {
      onSuccess: (result) => {
        if (offset === 0) {
          setAllLogs(result.logs as Array<Record<string, unknown>>);
        } else {
          setAllLogs((prev) => [...prev, ...(result.logs as Array<Record<string, unknown>>)]);
        }
      },
    }
  );

  const filteredLogs = allLogs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const entity = (log.entity as string) ?? "";
      const userName = (log.userName as string) ?? "";
      return entity.includes(q) || userName.includes(q);
    }
    return true;
  });

  const actions = [...new Set(allLogs.map((l) => l.action as string))];

  const loadMore = useCallback(() => {
    if (!isFetching && data && data.logs.length >= 50) {
      setOffset((prev) => prev + 50);
    }
  }, [isFetching, data]);

  const handleRefresh = () => {
    setOffset(0);
    setAllLogs([]);
    refetch();
  };

  if (isLoading && offset === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text>Erro ao carregar logs</Text>
        <Button onPress={handleRefresh}>Tentar novamente</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Buscar logs..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      <View style={styles.filterRow}>
        <Chip
          selected={actionFilter === null}
          onPress={() => setActionFilter(null)}
          style={styles.filterChip}
        >
          Todos
        </Chip>
        {actions.map((action) => (
          <Chip
            key={action}
            selected={actionFilter === action}
            onPress={() => setActionFilter(action)}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            {ACTION_LABELS[action] ?? action}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id as string}
        renderItem={({ item }) => (
          <List.Item
            title={`${ACTION_LABELS[item.action as string] ?? item.action} ${item.entity as string}`}
            description={`${(item.userName as string) ?? "Sistema"} · ${(item.createdAtPretty as string) ?? ""}`}
            left={(props) => (
              <List.Icon
                {...props}
                icon={
                  item.action === "create"
                    ? "plus-circle"
                    : item.action === "delete"
                      ? "delete-circle"
                      : "pencil-circle"
                }
                color={ACTION_COLORS[item.action as string] ?? theme.colors.primary}
              />
            )}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="clipboard-text-off" title="Nenhum log encontrado" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={isFetching && offset > 0}
        onRefresh={handleRefresh}
        contentContainerStyle={filteredLogs.length ? styles.list : styles.emptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    margin: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    marginBottom: 4,
  },
  list: {
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  listItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.12)",
  },
});
