import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  useTheme,
  Avatar,
  IconButton,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../lib/trpc";
import TextInput from "../components/ui/TextInput";

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

interface DayHours {
  start: string;
  end: string;
  lunch?: { start: string; end: string };
}

export default function EmpresaScreen() {
  const theme = useTheme();
  const { data: salon, isLoading, isError, refetch } = trpc.salon.get.useQuery();
  const updateMutation = trpc.salon.update.useMutation();
  const uploadMutation = trpc.images.upload.useMutation();

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [logo, setLogo] = useState("");
  const [workingHours, setWorkingHours] = useState<Record<string, DayHours[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (salon) {
      setName(salon.name ?? "");
      setCnpj(salon.cnpj ?? "");
      setAddress(salon.address ?? "");
      setPhone(salon.phone ?? "");
      setEmail(salon.email ?? "");
      setPixKey(salon.pixKey ?? "");
      setLogo(salon.logo ?? "");
    }
  }, [salon]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        try {
          const res = await uploadMutation.mutateAsync({
            base64: `data:image/jpeg;base64,${asset.base64}`,
          });
          setLogo(res.url);
        } catch {
          Alert.alert("Erro", "Falha ao fazer upload da imagem");
        }
      }
    }
  };

  const updateDayHours = (day: string, fields: Partial<DayHours>) => {
    setWorkingHours((prev) => {
      const current = prev[day]?.[0] ?? { start: "08:00", end: "18:00" };
      const updated = { ...current, ...fields };
      return { ...prev, [day]: [updated] };
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Nome do salão é obrigatório");
      return;
    }
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        cnpj: cnpj.trim() || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        pixKey: pixKey.trim() || undefined,
        logo: logo || undefined,
        workingHours: Object.keys(workingHours).length > 0 ? workingHours : undefined,
      });
      Alert.alert("Sucesso", "Dados do salão atualizados");
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar";
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text>Erro ao carregar dados do salão</Text>
        <Button onPress={() => refetch()}>Tentar novamente</Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Configurações do Salão
      </Text>

      <View style={styles.logoSection}>
        {logo ? (
          <Avatar.Image source={{ uri: logo }} size={100} />
        ) : (
          <Avatar.Icon size={100} icon="store" />
        )}
        <IconButton
          icon="camera"
          mode="contained"
          onPress={pickImage}
          style={styles.cameraButton}
        />
      </View>

      <TextInput label="Nome do Salão" value={name} onChangeText={setName} />
      <TextInput label="CNPJ" value={cnpj} onChangeText={setCnpj} />
      <TextInput label="Endereço" value={address} onChangeText={setAddress} />
      <TextInput label="Telefone" value={phone} onChangeText={setPhone} />
      <TextInput label="E-mail" value={email} onChangeText={setEmail} />
      <TextInput label="Chave PIX" value={pixKey} onChangeText={setPixKey} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Horários de Funcionamento
      </Text>

      {DAYS.map((day) => {
        const hours = workingHours[day.key]?.[0];
        return (
          <View key={day.key} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <View style={styles.hourInputs}>
              <TextInput
                label="Início"
                value={hours?.start ?? "08:00"}
                onChangeText={(v) => updateDayHours(day.key, { start: v })}
              />
              <TextInput
                label="Fim"
                value={hours?.end ?? "18:00"}
                onChangeText={(v) => updateDayHours(day.key, { end: v })}
              />
            </View>
          </View>
        );
      })}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
      >
        Salvar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 24,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  cameraButton: {
    position: "absolute",
    bottom: -8,
    right: "35%",
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  dayRow: {
    marginBottom: 8,
  },
  dayLabel: {
    fontWeight: "600",
    marginBottom: 4,
  },
  hourInputs: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    marginTop: 32,
  },
});
