import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessibilityLabel="Tela de erro"
      accessibilityRole="alert"
    >
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={80}
        color={theme.colors.error}
        style={styles.icon}
      />

      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Ocorreu um erro
      </Text>

      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>

      <Button
        mode="contained"
        onPress={onRetry}
        style={styles.retryButton}
        accessibilityLabel="Tentar novamente"
        accessibilityRole="button"
      >
        Tentar novamente
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 24,
  },
});

export default ErrorScreen;
