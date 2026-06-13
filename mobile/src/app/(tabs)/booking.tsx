import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';

export default function BookingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Novo Agendamento</Text>
        <Text style={styles.subtitle}>Crie um novo agendamento</Text>
        
        {/* Formulário de agendamento será implementado */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Formulário de agendamento em desenvolvimento
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
