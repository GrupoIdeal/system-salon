import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import {
  Text,
  FAB,
  Button,
  ActivityIndicator,
  useTheme,
  List,
  Chip,
  Portal,
  Dialog,
  Switch,
} from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import { trpc } from "../lib/trpc";
import TextInput from "../components/ui/TextInput";
import EmptyState from "../components/EmptyState";

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export default function UsuariosScreen() {
  const theme = useTheme();
  const { data: users, isLoading, isError, refetch } = trpc.users.list.useQuery();
  const createMutation = trpc.users.create.useMutation();
  const editMutation = trpc.users.edit.useMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (user: NonNullable<typeof users>[number]) => {
    setEditingId(user.id);
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role: user.role === "admin" ? "admin" : "user",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Erro", "Nome é obrigatório");
      return;
    }
    if (!form.email.trim()) {
      Alert.alert("Erro", "Email é obrigatório");
      return;
    }
    if (!editingId && !form.password) {
      Alert.alert("Erro", "Senha é obrigatória");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await editMutation.mutateAsync({
          id: editingId,
          data: {
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            ...(form.password ? { password: form.password } : {}),
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
      setModalVisible(false);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar";
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
    item: NonNullable<typeof users>[number]
  ) => {
    return (
      <View style={styles.swipeActions}>
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          onPress={() => openEdit(item)}
          style={styles.swipeButton}
        >
          Editar
        </Button>
      </View>
    );
  };

  const renderItem = ({ item }: { item: NonNullable<typeof users>[number] }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
    >
      <List.Item
        title={item.name ?? "Sem nome"}
        description={item.email}
        left={(props) => <List.Icon {...props} icon="account" />}
        right={() => (
          <Chip
            icon={item.role === "admin" ? "shield-account" : "account"}
            style={styles.roleChip}
          >
            {item.role === "admin" ? "Admin" : "Usuário"}
          </Chip>
        )}
        style={styles.listItem}
      />
    </Swipeable>
  );

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
        <Text>Erro ao carregar usuários</Text>
        <Button onPress={() => refetch()}>Tentar novamente</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={users ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="account-off"
            title="Nenhum usuário encontrado"
            actionLabel="Adicionar usuário"
            onAction={openCreate}
          />
        }
        contentContainerStyle={users?.length ? styles.list : styles.emptyList}
      />

      <FAB icon="plus" style={styles.fab} onPress={openCreate} />

      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>{editingId ? "Editar Usuário" : "Novo Usuário"}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome"
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              keyboardType="email-address"
            />
            <TextInput
              label={editingId ? "Nova senha (deixe vazio para manter)" : "Senha"}
              value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              secureTextEntry
            />
            <View style={styles.roleSwitch}>
              <Text>Administrador</Text>
              <Switch
                value={form.role === "admin"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, role: v ? "admin" : "user" }))
                }
              />
            </View>
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
  roleChip: {
    alignSelf: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  swipeButton: {
    marginHorizontal: 4,
  },
  roleSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
