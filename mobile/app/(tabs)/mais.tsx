import React from 'react'
import { StyleSheet, View, FlatList, Alert } from 'react-native'
import { List, Text, Divider, Button, useTheme } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'

interface MenuItem {
  label: string
  icon: string
  route?: string
  adminOnly?: boolean
  onPress?: () => void
}

export default function MaisScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  const menuItems: MenuItem[] = [
    { label: 'Especialistas', icon: 'account-tie', route: '/especialistas' },
    { label: 'Avaliações', icon: 'star-outline', route: '/avaliacoes' },
    { label: 'Ajuda Libras', icon: 'sign-language', route: '/ajuda-libras' },
    { label: 'Empresa', icon: 'store-outline', route: '/empresa', adminOnly: true },
    { label: 'Usuários', icon: 'account-multiple-outline', route: '/usuarios', adminOnly: true },
    { label: 'Logs', icon: 'text-box-search-outline', route: '/logs', adminOnly: true },
  ]

  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin)

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.label}
        renderItem={({ item, index }) => (
          <View>
            <List.Item
              title={item.label}
              titleStyle={{ color: theme.colors.onSurface }}
              onPress={() => {
                if (item.route) router.push(item.route)
              }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={() => (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                />
              )}
              right={(props) => (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
            />
            {index < visibleItems.length - 1 && <Divider />}
          </View>
        )}
        ListHeaderComponent={
          <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
            <MaterialCommunityIcons
              name="account-circle"
              size={56}
              color={theme.colors.primary}
            />
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
              {user?.name ?? 'Usuário'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.email ?? ''}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              textColor={theme.colors.error}
              style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            >
              Sair
            </Button>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    borderRadius: 12,
  },
})
