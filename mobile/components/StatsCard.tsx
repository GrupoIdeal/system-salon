import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon }) => {
  const theme = useTheme();

  const trendColor = trend === "up" ? "#10b981" : "#ef4444";
  const trendIcon = trend === "up" ? "trending-up" : "trending-down";

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      accessibilityLabel={`${title}: ${value}`}
    >
      <Card.Content>
        <View style={styles.topRow}>
          <View
            style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={theme.colors.onPrimaryContainer}
            />
          </View>

          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trendColor + "20" }]}>
              <MaterialCommunityIcons
                name={trendIcon}
                size={16}
                color={trendColor}
              />
            </View>
          )}
        </View>

        <Text
          variant="headlineMedium"
          style={[styles.value, { color: theme.colors.onSurface }]}
        >
          {value}
        </Text>

        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    borderRadius: 8,
    padding: 8,
  },
  trendBadge: {
    borderRadius: 12,
    padding: 4,
  },
  value: {
    fontWeight: "bold",
  },
});

export default StatsCard;
