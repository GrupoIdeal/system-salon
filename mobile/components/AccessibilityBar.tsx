import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Switch, Text, useTheme } from "react-native-paper";

interface AccessibilityBarProps {
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onToggleContrast: () => void;
  highContrast: boolean;
}

const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  onIncreaseFont,
  onDecreaseFont,
  onToggleContrast,
  highContrast,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      accessibilityLabel="Barra de acessibilidade"
      accessibilityRole="toolbar"
    >
      <IconButton
        icon="format-font-size-increase"
        size={24}
        onPress={onIncreaseFont}
        accessibilityLabel="Aumentar tamanho da fonte"
        accessibilityRole="button"
      />
      <IconButton
        icon="format-font-size-decrease"
        size={24}
        onPress={onDecreaseFont}
        accessibilityLabel="Diminuir tamanho da fonte"
        accessibilityRole="button"
      />
      <View style={styles.contrastRow}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
          Alto Contraste
        </Text>
        <Switch
          value={highContrast}
          onValueChange={onToggleContrast}
          accessibilityLabel="Alternar alto contraste"
          accessibilityRole="switch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  contrastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default AccessibilityBar;
