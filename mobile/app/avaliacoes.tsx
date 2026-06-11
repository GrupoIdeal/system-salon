import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  useTheme,
  Card,
  Avatar,
  ProgressBar,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { trpc } from "../lib/trpc";
import EmptyState from "../components/EmptyState";

function StarRating({ stars, size = 16 }: { stars: number; size?: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialCommunityIcons
          key={s}
          name={s <= stars ? "star" : "star-outline"}
          size={size}
          color={s <= stars ? "#FFB300" : "#BDBDBD"}
        />
      ))}
    </View>
  );
}

export default function AvaliacoesScreen() {
  const theme = useTheme();
  const { data: ratings, isLoading, isError, refetch: refetchRatings } =
    trpc.ratings.getAll.useQuery();
  const { data: averages, refetch: refetchAverages } =
    trpc.ratings.getAllAverages.useQuery();

  const handleRefresh = () => {
    refetchRatings();
    refetchAverages();
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text>Erro ao carregar avaliações</Text>
        <Button onPress={handleRefresh}>Tentar novamente</Button>
      </View>
    );
  }

  const averageEntries = averages
    ? Object.entries(averages as Record<string, { average: number; count: number }>)
    : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Avaliações
      </Text>

      {averageEntries.length > 0 && (
        <View style={styles.averagesSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Média por Especialista
          </Text>
          {averageEntries.map(([specialistId, data]) => (
            <View key={specialistId} style={styles.averageRow}>
              <Text style={styles.averageName}>
                {specialistId.slice(0, 8)}...
              </Text>
              <StarRating stars={Math.round(data.average)} />
              <Text style={styles.averageValue}>
                {data.average.toFixed(1)} ({data.count})
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Comentários
      </Text>

      {!ratings || ratings.length === 0 ? (
        <EmptyState
          icon="star-off"
          title="Nenhuma avaliação recebida"
          subtitle="As avaliações aparecerão aqui após os clientes avaliarem"
        />
      ) : (
        (ratings as Array<Record<string, unknown>>).map((rating) => (
          <Card key={rating.id as string} style={styles.ratingCard}>
            <Card.Content>
              <View style={styles.ratingHeader}>
                <Avatar.Icon size={40} icon="account" />
                <View style={styles.ratingInfo}>
                  <Text style={styles.clientName}>
                    {(rating.clientName as string) ?? "Cliente"}
                  </Text>
                  <StarRating stars={(rating.stars as number) ?? 0} />
                </View>
              </View>
              {rating.comment && (
                <Text style={styles.comment}>{rating.comment as string}</Text>
              )}
              <Text style={styles.specialistName}>
                Especialista: {(rating.specialistName as string) ?? "N/A"}
              </Text>
              <Text style={styles.dateText}>
                {(rating.submittedAt as string)
                  ? new Date(rating.submittedAt as string).toLocaleDateString("pt-BR")
                  : ""}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  averagesSection: {
    marginBottom: 8,
  },
  averageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  averageName: {
    flex: 1,
    fontSize: 14,
  },
  averageValue: {
    fontSize: 13,
    color: "#666",
    minWidth: 60,
    textAlign: "right",
  },
  ratingCard: {
    marginBottom: 12,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: "italic",
  },
  specialistName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: "#999",
  },
});
