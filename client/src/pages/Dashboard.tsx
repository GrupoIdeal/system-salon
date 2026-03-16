import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Star,
  Target,
  BarChart3,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  // OTIMIZADO: Busca TODOS os dados do dashboard em uma única chamada
  const dashboardQuery = trpc.dashboard.all.useQuery({ chartDays: 30 });
  // Produtos com estoque baixo (stock <= minStock) — Sprint 3
  const lowStockQuery = trpc.products.lowStock.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Extrair dados da query unificada
  const metrics = dashboardQuery.data?.metrics;
  const revenueChart = dashboardQuery.data?.revenueChart;
  const upcomingAppointments = dashboardQuery.data?.upcomingAppointments;

  // Preparar dados do gráfico de receita
  const revenueChartData =
    revenueChart?.map(item => {
      try {
        return {
          date: item.date
            ? format(parseISO(item.date), "dd/MM", { locale: ptBR })
            : "",
          receita: item.revenue ?? 0,
          transacoes: item.transactions ?? 0,
        };
      } catch {
        return {
          date: item.date ?? "",
          receita: item.revenue ?? 0,
          transacoes: item.transactions ?? 0,
        };
      }
    }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Visão geral do seu negócio em tempo real
          </p>
        </div>

        {/* ---- Alerta de Estoque Baixo (Sprint 3) ---- */}
        {lowStockQuery.data && lowStockQuery.data.length > 0 && (
          <Link href="/produtos">
            <Card className="cursor-pointer border-destructive/60 bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <CardTitle className="text-sm font-semibold text-destructive">
                    Estoque Baixo — {lowStockQuery.data.length}{" "}
                    {lowStockQuery.data.length === 1 ? "produto" : "produtos"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {lowStockQuery.data
                      .slice(0, 3)
                      .map(p => p.name)
                      .join(", ")}
                    {lowStockQuery.data.length > 3 && " e mais..."}
                  </CardDescription>
                </div>
                <Package className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardHeader>
            </Card>
          </Link>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receita do Mês */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita do Mês
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[var(--primary)]" />
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-[var(--primary)]">
                    {formatCurrency(metrics?.revenue.monthly || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.revenue.monthlyTransactions || 0} transações
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Receita da Semana */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Semanal
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-[var(--primary)]">
                    {formatCurrency(metrics?.revenue.weekly || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Agendamentos Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-[var(--primary)]" />
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {metrics?.appointments.today.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.appointments.today.completed || 0} concluídos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Taxa de Ocupação */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Ocupação
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-[var(--primary)]">
                    {metrics?.appointments.occupationRate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Ocupação hoje</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Receita dos Últimos 30 Dias */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Evolução da Receita (30 dias)</CardTitle>
            <CardDescription>
              Acompanhe o crescimento da receita do seu salão
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={value => formatCurrency(value)} />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Receita",
                    ]}
                    labelFormatter={label => `Data: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="var(--chart-3)"
                    fill="var(--chart-3)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Seção de Rankings e Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Serviços Mais Lucrativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[var(--primary)]" />
                Top 5 Serviços do Mês
              </CardTitle>
              <CardDescription>Serviços que mais geram receita</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : metrics?.topServices && metrics.topServices.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topServices.map((service, index) => (
                    <div
                      key={service.serviceId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--chart-1)] text-[var(--primary)] font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{service.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {Number(service.totalBookings)} agendamentos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--primary)]">
                          {formatCurrency(Number(service.totalRevenue))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum serviço encontrado este mês
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top 5 Especialistas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--primary)]" />
                Top 5 Especialistas do Mês
              </CardTitle>
              <CardDescription>
                Especialistas que mais geram receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : metrics?.topSpecialists &&
                metrics.topSpecialists.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topSpecialists.map((specialist, index) => (
                    <div
                      key={specialist.specialistId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)] font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {specialist.specialistName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {Number(specialist.totalAppointments)} atendimentos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--primary)]">
                          {formatCurrency(Number(specialist.totalRevenue))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum especialista encontrado este mês
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seção de Clientes e Próximos Agendamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Clientes Mais Valiosos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--primary)]" />
                Clientes Mais Valiosos
              </CardTitle>
              <CardDescription>
                Clientes que mais contribuem para a receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : metrics?.topClients && metrics.topClients.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {metrics.topClients.slice(0, 5).map((client, index) => (
                    <div
                      key={client.clientId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-[var(--background)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--primary)] font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {Number(client.totalVisits)} visitas
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Última:{" "}
                            {new Date(client.lastVisit).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--primary)]">
                          {formatCurrency(Number(client.totalSpent))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum cliente encontrado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Próximos Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--primary)]" />
                Próximos Agendamentos
              </CardTitle>
              <CardDescription>
                Agendamentos confirmados e pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {upcomingAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-[var(--background)]"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {apt.client?.name} - {apt.service?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(apt.appointmentDate).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          às {apt.appointmentTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Com {apt.specialist?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            apt.status === "confirmed"
                              ? "default"
                              : apt.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            apt.status === "confirmed"
                              ? "bg-[var(--secondary)] text-[var(--primary)]"
                              : apt.status === "pending"
                                ? "bg-[var(--secondary)] text-[var(--primary)]"
                                : ""
                          }
                        >
                          {apt.status === "confirmed"
                            ? "Confirmado"
                            : apt.status === "pending"
                              ? "Pendente"
                              : (apt.status ?? "—")}
                        </Badge>
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
      </div>
    </DashboardLayout>
  );
}
