import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Text,
  FAB,
  Button,
  ActivityIndicator,
  useTheme,
  List,
  Avatar,
  Chip,
  Portal,
  Dialog,
} from "react-native-paper";
import { trpc } from "../lib/trpc";
import TextInput from "../components/ui/TextInput";
import EmptyState from "../components/EmptyState";

interface SpecialistForm {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

const emptyForm: SpecialistForm = {
  name: "",
  specialty: "",
  email: "",
  phone: "",
  status: "active",
};

export default function EspecialistasScreen() {
  const theme = useTheme();
  const { data: specialists, isLoading, isError, refetch } = trpc.specialists.list.useQuery();
  const createMutation = trpc.specialists.create.useMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<SpecialistForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Erro", "Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      await createMutation.mutateAsync({
        specialist: {
          name: form.name.trim(),
          specialty: form.specialty.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          status: form.status,
        },
        schedule: {
          timeSlotDuration: 30,
          bufferTime: 0,
          allowBookingDaysInAdvance: 30,
          minimumNoticeHours: 2,
          autoConfirmBookings: true,
          allowOnlineBooking: true,
          workingHours: Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            isWorking: i < 6,
            startTime: "08:00",
            endTime: "18:00",
          })),
        },
      });
      setModalVisible(false);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar";
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await trpc.specialists.update.mutate({
        id,
        data: { name, status: newStatus },
      });
      refetch();
    } catch {
      Alert.alert("Erro", "Falha ao alterar status");
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
        <Text>Erro ao carregar especialistas</Text>
        <Button onPress={() => refetch()}>Tentar novamente</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={specialists ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${item.specialty ?? "Sem especialidade"} · ${item.email ?? ""} · ${item.phone ?? ""}`}
            left={(props) =>
              item.photo ? (
                <Avatar.Image {...props} source={{ uri: item.photo }} size={48} />
              ) : (
                <Avatar.Icon {...props} icon="account-tie" size={48} />
              )
            }
            right={() => (
              <View style={styles.itemRight}>
                <Chip
                  icon={item.status === "active" ? "check-circle" : "close-circle"}
                  onPress={() => toggleStatus(item.id, item.status, item.name)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        item.status === "active" ? "#E8F5E9" : "#FFEBEE",
                    },
                  ]}
                >
                  {item.status === "active" ? "Ativo" : "Inativo"}
                </Chip>
                <Button
                  mode="text"
                  compact
                  icon="calendar-clock"
                  onPress={() => {
                  }}
                >
                  Agenda
                </Button>
              </View>
            )}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="account-tie-off"
            title="Nenhum especialista cadastrado"
            actionLabel="Adicionar especialista"
            onAction={openCreate}
          />
        }
        contentContainerStyle={specialists?.length ? styles.list : styles.emptyList}
      />

      <FAB icon="plus" style={styles.fab} onPress={openCreate} />

      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>Novo Especialista</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome"
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <TextInput
              label="Especialidade"
              value={form.specialty}
              onChangeText={(v) => setForm((p) => ({ ...p, specialty: v }))}
            />
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              keyboardType="email-address"
            />
            <TextInput
              label="Telefone"
              value={form.phone}
              onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
              keyboardType="phone-pad"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Cancelar</Button>
            <Button onPress={handleSave} loading={saving} disabled={saving}>
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
  listItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.12)",
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  statusChip: {
    height: 28,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
