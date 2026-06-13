import React from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Iniciando aplicativo..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
