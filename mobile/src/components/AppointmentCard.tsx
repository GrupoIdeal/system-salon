import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';

interface AppointmentCardProps {
  id: string;
  clientName: string;
  serviceName: string;
  specialistName?: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  onPress?: () => void;
}

export function AppointmentCard({
  clientName,
  serviceName,
  specialistName,
  dateTime,
  status,
  onPress,
}: AppointmentCardProps) {
  const statusConfig = {
    pending: { label: 'Pendente', color: Colors.warning },
    confirmed: { label: 'Confirmado', color: Colors.primary },
    completed: { label: 'Concluído', color: Colors.success },
    cancelled: { label: 'Cancelado', color: Colors.destructive },
  };

  const config = statusConfig[status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.serviceName}>{serviceName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${config.color}15` }]}>
          <Text style={[styles.statusText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Data/Hora:</Text>
          <Text style={styles.detailValue}>{dateTime}</Text>
        </View>
        {specialistName && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Especialista:</Text>
            <Text style={styles.detailValue}>{specialistName}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.mutedForeground,
  },
  detailValue: {
    fontSize: 13,
    color: Colors.foreground,
    fontWeight: '500',
  },
});
