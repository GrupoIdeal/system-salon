import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@/utils/colors';
import { Button } from '@/components/Button';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navegação é tratada pelo AuthContext
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>💇</Text>
        <Text style={styles.logoText}>Salon Booking</Text>
        <Text style={styles.tagline}>Gestão completa do seu salão</Text>
      </View>

      {/* Formulário de Login */}
      <View style={styles.form}>
        <TouchableOpacity 
          style={styles.input}
          onPress={() => {}}
        >
          <Ionicons name="mail-outline" size={20} color={Colors.mutedForeground} />
          <Text style={styles.inputPlaceholder}>E-mail</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.input}
          onPress={() => {}}
        >
          <Ionicons name="lock-closed-outline" size={20} color={Colors.mutedForeground} />
          <Text style={styles.inputPlaceholder}>Senha</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => {}}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <Button
          title="Entrar"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta?</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.registerLink}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  tagline: {
    fontSize: 16,
    color: Colors.mutedForeground,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.mutedForeground,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    color: Colors.foreground,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
