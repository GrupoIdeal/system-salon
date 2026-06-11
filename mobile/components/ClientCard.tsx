import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface ClientData {
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  photo?: string | null;
}

interface ClientCardProps {
  client: ClientData;
  onPress?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onPress }) => {
  const theme = useTheme();

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityLabel={`Cliente ${client.name}`}
      accessibilityRole="button"
    >
      <Card.Content>
        <View style={styles.header}>
          {client.photo ? (
            <Avatar.Image size={48} source={{ uri: client.photo }} />
          ) : (
            <Avatar.Icon
              size={48}
              icon="account"
              color={theme.colors.onPrimaryContainer}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )}

          <View style={styles.headerInfo}>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface }}
            >
              {client.name}
            </Text>

            {client.phone ? (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.contactText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {client.phone}
                </Text>
              </View>
            ) : null}

            {client.email ? (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons
                  name="email"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.contactText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {client.email}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[styles.loyaltyBadge, { backgroundColor: theme.colors.tertiaryContainer }]}
            accessibilityLabel={`${client.loyaltyPoints} pontos de fidelidade`}
          >
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={theme.colors.onTertiaryContainer}
            />
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onTertiaryContainer, marginLeft: 4 }}
            >
              {client.loyaltyPoints}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  contactText: {
    marginLeft: 4,
  },
  loyaltyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
});

export default ClientCard;
