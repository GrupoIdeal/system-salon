import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export function LoadingScreen({ message = 'Carregando...', showLogo = true }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💇</Text>
        </View>
      )}
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 64,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.foreground,
    fontWeight: '500',
  },
});
