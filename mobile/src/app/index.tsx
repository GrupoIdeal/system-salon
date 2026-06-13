import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Iniciando aplicativo..." />;
  }

  // Se estiver autenticado, redireciona para o dashboard (tabs)
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Se não estiver autenticado, redireciona para login
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
