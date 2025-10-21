import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, Scissors, Calendar, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  // Obter dados da última semana
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);

  const appointmentsQuery = trpc.appointments.list.useQuery({
    startDate: sevenDaysAgo,
    endDate: today,
  });

  const clientsQuery = trpc.clients.list.useQuery({});
  const servicesQuery = trpc.services.list.useQuery();

  // Agendamentos para hoje
  const todayAppointments = appointmentsQuery.data?.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate.toDateString() === today.toDateString();
  }) || [];

  // Próximos 5 agendamentos
  const upcomingAppointments = appointmentsQuery.data?.slice(0, 5) || [];

  // Calculando a receita do mês (implementação futura)

  // Preparar dados para o gráfico de 7 dias
  const last7DaysData = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(today, 6 - index);
    const dayFormatted = format(date, 'EEE', { locale: ptBR });

    const appointmentsForDay = appointmentsQuery.data?.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === date.toDateString();
    }) || [];

    return {
      name: dayFormatted,
      agendamentos: appointmentsForDay.length,
      dia: format(date, 'dd/MM')
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao seu painel de controle
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {appointmentsQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{todayAppointments.length}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Agendamentos para hoje
              </p>
            </CardContent>
          </Card>

          {/* Total Clients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Cadastrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {clientsQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{clientsQuery.data?.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total de clientes
              </p>
            </CardContent>
          </Card>

          {/* Total Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Serviços Ativos
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {servicesQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">
                  {servicesQuery.data?.filter((s) => s.status === "active").length || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Serviços disponíveis
              </p>
            </CardContent>
          </Card>

          {/* Total Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Agendamentos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {appointmentsQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{appointmentsQuery.data?.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          {/* Revenue this month */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {appointmentsQuery.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(0) /* Será implementado quando tivermos preço nos agendamentos */}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Mês atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart - Last 7 days */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos nos últimos 7 dias</CardTitle>
            <CardDescription>
              Visão geral dos agendamentos da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {appointmentsQuery.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={last7DaysData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name) => [value, 'Agendamentos']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return `${payload[0].payload.dia}`;
                      }
                      return label;
                    }}
                  />
                  <Bar
                    dataKey="agendamentos"
                    fill="#4F46E5"
                    radius={[4, 4, 0, 0]}
                    name="Agendamentos"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>
              Seus 5 próximos agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={`skeleton-${item}`} className="h-12 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {new Date(apt.appointmentDate).toLocaleDateString("pt-BR")} às{" "}
                        {apt.appointmentTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {apt.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${apt.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : apt.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento próximo
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

