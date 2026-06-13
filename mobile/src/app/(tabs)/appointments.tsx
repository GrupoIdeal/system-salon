import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';
import { Button } from '@/components/Button';
import { useOffline } from '@/contexts/OfflineContext';

export default function AppointmentsScreen() {
  const { isOnline, queue } = useOffline();

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📴 Você está offline</Text>
          <Text style={styles.queueText}>
            {queue.length} ação(ões) na fila
          </Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>Agendamentos</Text>
        <Text style={styles.subtitle}>Gerencie todos os agendamentos</Text>
        
        {/* Lista de agendamentos será implementada */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Lista de agendamentos em desenvolvimento
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  offlineBanner: {
    backgroundColor: Colors.warning,
    padding: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: Colors.warningForeground,
    fontWeight: '600',
    fontSize: 14,
  },
  queueText: {
    color: Colors.warningForeground,
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 4,
    marginBottom: 24,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.mutedForeground,
  },
});
