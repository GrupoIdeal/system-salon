import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessibilityLabel={message ?? "Carregando"}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
      />

      {message && (
        <Text
          variant="bodyLarge"
          style={[styles.message, { color: theme.colors.onSurface }]}
        >
          {message}
        </Text>
      )}
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
  message: {
    marginTop: 16,
    textAlign: "center",
  },
});

export default LoadingScreen;
