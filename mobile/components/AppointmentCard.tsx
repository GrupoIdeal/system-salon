import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface AppointmentData {
  clientName: string;
  serviceName: string;
  specialistName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onPress?: () => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Pendente", color: "#f59e0b", icon: "clock-outline" },
  confirmed: { label: "Confirmado", color: "#3b82f6", icon: "check-circle-outline" },
  completed: { label: "Concluído", color: "#10b981", icon: "check-decagram-outline" },
  cancelled: { label: "Cancelado", color: "#ef4444", icon: "close-circle-outline" },
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
}) => {
  const theme = useTheme();
  const status = statusConfig[appointment.status] ?? statusConfig.pending;

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityLabel={`Agendamento de ${appointment.clientName}`}
      accessibilityRole="button"
    >
      <Card.Content>
        <View style={styles.header}>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onSurface, flex: 1 }}
          >
            {appointment.clientName}
          </Text>
          <View
            style={[styles.badge, { backgroundColor: status.color + "20" }]}
            accessibilityLabel={`Status: ${status.label}`}
          >
            <MaterialCommunityIcons
              name={status.icon}
              size={14}
              color={status.color}
            />
            <Text
              variant="labelSmall"
              style={{ color: status.color, marginLeft: 4 }}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="content-cut"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="bodyMedium"
            style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}
          >
            {appointment.serviceName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="account-tie"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="bodyMedium"
            style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}
          >
            {appointment.specialistName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="bodyMedium"
            style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}
          >
            {appointment.appointmentDate} às {appointment.appointmentTime}
          </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    marginLeft: 8,
  },
});

export default AppointmentCard;
