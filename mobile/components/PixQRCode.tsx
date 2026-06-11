import React from "react";
import { View, StyleSheet, Clipboard } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface PixQRCodeProps {
  pixKey: string;
  amount?: number;
}

const PixQRCode: React.FC<PixQRCodeProps> = ({ pixKey, amount }) => {
  const theme = useTheme();

  const handleCopy = () => {
    Clipboard.setString(pixKey);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      accessibilityLabel="Área do PIX"
    >
      <View
        style={[styles.qrPlaceholder, { borderColor: theme.colors.primary }]}
        accessibilityLabel="Espaço reservado para o QR Code"
      >
        <MaterialCommunityIcons
          name="qrcode"
          size={120}
          color={theme.colors.primary}
        />
      </View>

      <Text
        variant="titleMedium"
        style={{ color: theme.colors.onSurface, marginTop: 16 }}
      >
        Chave PIX
      </Text>

      <Text
        variant="bodyLarge"
        style={[styles.pixKeyText, { color: theme.colors.onSurface }]}
        accessibilityLabel={`Chave PIX: ${pixKey}`}
      >
        {pixKey}
      </Text>

      {amount !== undefined && (
        <Text
          variant="headlineSmall"
          style={[styles.amountText, { color: theme.colors.primary }]}
          accessibilityLabel={`Valor: R$ ${amount.toFixed(2)}`}
        >
          R$ {amount.toFixed(2)}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleCopy}
        style={styles.copyButton}
        accessibilityLabel="Copiar chave PIX"
        accessibilityRole="button"
      >
        Copiar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    margin: 16,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  pixKeyText: {
    marginTop: 8,
    textAlign: "center",
  },
  amountText: {
    marginTop: 8,
    fontWeight: "bold",
  },
  copyButton: {
    marginTop: 20,
    width: "100%",
  },
});

export default PixQRCode;
