import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  const themes: Array<{ label: string; value: typeof theme }> = [
    { label: '☀️ Claro', value: 'light' },
    { label: '🌙 Escuro', value: 'dark' },
    { label: '🔒 Alto Contraste', value: 'high-contrast' },
    { label: '📱 Sistema', value: 'system' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileRole}>{user?.role}</Text>
          </View>
        </View>
      </View>

      {/* Tema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.themeGrid}>
          {themes.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.themeOption,
                theme === t.value && styles.themeOptionActive,
              ]}
              onPress={() => setTheme(t.value)}
            >
              <Text style={styles.themeOptionText}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="notifications-outline" size={24} color={Colors.foreground} />
          <Text style={styles.actionText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="lock-closed-outline" size={24} color={Colors.foreground} />
          <Text style={styles.actionText}>Segurança</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.foreground} />
          <Text style={styles.actionText}>Ajuda e Suporte</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.foreground} />
          <Text style={styles.actionText}>Sobre o App</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Button
          title="Sair"
          variant="destructive"
          onPress={logout}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.destructiveForeground} />}
        />
        <Text style={styles.version}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mutedForeground,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.foreground,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  themeOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.foreground,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 16,
  },
});
