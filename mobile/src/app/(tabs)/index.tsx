import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@/utils/colors';
import { StatCard } from '@/components/StatCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';

export default function IndexScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const loadDashboard = async () => {
    try {
      const response = await api.dashboard.all({ chartDays: 7 });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name || 'Usuário'}!</Text>
          <Text style={styles.subtitle}>Visão geral do seu negócio</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Receita (7d)"
          value={metrics.revenue ? `R$ ${metrics.revenue.toFixed(2)}` : 'R$ 0,00'}
          icon="cash-outline"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Agendamentos"
          value={metrics.appointments || 0}
          icon="calendar-outline"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Clientes"
          value={metrics.clients || 0}
          icon="people-outline"
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatCard
          title="Avaliações"
          value={metrics.ratings || 0}
          icon="star-outline"
          trend={{ value: 3.4, isPositive: false }}
        />
      </View>

      {/* Próximos Agendamentos */}
      <Card title="Próximos Agendamentos" style={styles.section}>
        {dashboardData?.upcomingAppointments?.length > 0 ? (
          dashboardData.upcomingAppointments.slice(0, 3).map((appointment: any) => (
            <AppointmentCard
              key={appointment.id}
              id={appointment.id}
              clientName={appointment.client?.name || 'Cliente'}
              serviceName={appointment.service?.name || 'Serviço'}
              specialistName={appointment.specialist?.name}
              dateTime={new Date(appointment.date).toLocaleString('pt-BR')}
              status={appointment.status}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.mutedForeground} />
            <Text style={styles.emptyText}>Nenhum agendamento próximo</Text>
          </View>
        )}
        
        <Button 
          title="Ver todos" 
          variant="outline" 
          onPress={() => {}}
          style={styles.viewAllButton}
        />
      </Card>

      {/* Alerta de Estoque Baixo */}
      {dashboardData?.lowStockProducts?.length > 0 && (
        <Card 
          title="⚠️ Estoque Baixo" 
          variant="outlined"
          style={[styles.section, { borderColor: Colors.warning }]}
        >
          {dashboardData.lowStockProducts.map((product: any) => (
            <View key={product.id} style={styles.stockItem}>
              <Text style={styles.stockProduct}>{product.name}</Text>
              <Text style={[styles.stockQuantity, { color: Colors.warning }]}>
                {product.stock} unidades
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  viewAllButton: {
    marginTop: 12,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stockProduct: {
    fontSize: 14,
    color: Colors.foreground,
  },
  stockQuantity: {
    fontSize: 14,
    fontWeight: '600',
  },
});
