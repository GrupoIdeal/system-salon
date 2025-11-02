import { useState } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Calendar,
  Search,
  Edit,
  Trash2,
  User,
  Scissors,
  CheckCircle,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarPicker } from "@/components/CalendarPicker";
import { AppointmentModal } from "@/components/AppointmentModal";
import { AppointmentStats } from "@/components/AppointmentStats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentData {
  id: string;
  clientId: string;
  serviceId: string;
  specialistId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | null;
  notes?: string | null;
  client?: { id: string; name: string; phone?: string | null } | null;
  service?: {
    id: string;
    name: string;
    duration: number;
    price: string;
  } | null;
  specialist?: { id: string; name: string; specialty?: string | null } | null;
}

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  // Calcular range de datas baseado no modo de visualização
  const getDateRange = () => {
    // Normaliza a data para início do dia para evitar diferenças por hora
    const base = startOfDay(selectedDate);

    switch (viewMode) {
      case "day": {
        return { start: startOfDay(base), end: endOfDay(base) };
      }
      case "week": {
        // Semana começando no domingo (weekStartsOn: 0)
        const weekStart = startOfWeek(base, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(base, { weekStartsOn: 0 });
        return { start: startOfDay(weekStart), end: endOfDay(weekEnd) };
      }
      case "month": {
        const monthStart = startOfMonth(base);
        const monthEnd = endOfMonth(base);
        return { start: startOfDay(monthStart), end: endOfDay(monthEnd) };
      }
      default:
        return { start: startOfDay(base), end: endOfDay(base) };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Converter range para UTC (início do dia UTC / fim do dia UTC) para evitar problemas de fuso
  const startDateUTC = new Date(
    Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0,
      0
    )
  );
  const endDateUTC = new Date(
    Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59,
      999
    )
  );

  const appointmentsQuery = trpc.appointments.list.useQuery({
    startDate: startDateUTC,
    endDate: endDateUTC,
  });

  // Mutations para ações rápidas
  const completeAppointmentMutation = trpc.appointments.complete.useMutation({
    onSuccess: () => appointmentsQuery.refetch(),
    onError: error => alert(`Erro ao concluir agendamento: ${error.message}`),
  });

  const cancelAppointmentMutation = trpc.appointments.cancel.useMutation({
    onSuccess: () => appointmentsQuery.refetch(),
    onError: error => alert(`Erro ao cancelar agendamento: ${error.message}`),
  });

  const deleteAppointmentMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => appointmentsQuery.refetch(),
    onError: error => alert(`Erro ao excluir agendamento: ${error.message}`),
  });

  // Contagem de agendamentos por data para o calendário
  const appointmentCounts =
    appointmentsQuery.data?.reduce(
      (acc, apt) => {
        const dateKey = new Date(apt.appointmentDate)
          .toISOString()
          .split("T")[0];
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // Filtrar agendamentos
  const filteredAppointments =
    appointmentsQuery.data?.filter(apt => {
      const matchesSearch =
        searchTerm === "" ||
        apt.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialist?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  // Handlers
  const handleEditAppointment = (appointment: AppointmentData) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleSuccess = () => {
    appointmentsQuery.refetch();
  };

  // Handlers para ações rápidas
  const handleQuickComplete = (appointmentId: string) => {
    if (
      confirm(
        "Confirma a conclusão deste agendamento? Isso registrará a receita no sistema."
      )
    ) {
      completeAppointmentMutation.mutate({
        id: appointmentId,
        paymentMethod: "cash" as const,
      });
    }
  };

  const handleQuickCancel = (appointmentId: string) => {
    const reason = prompt("Motivo do cancelamento (opcional):");
    if (reason !== null) {
      cancelAppointmentMutation.mutate({
        id: appointmentId,
        reason: reason || undefined,
      });
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir permanentemente este agendamento?"
      )
    ) {
      deleteAppointmentMutation.mutate({ id: appointmentId });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-[var(--success)]/10 text-[var(--success)]";
      case "pending":
        return "bg-[var(--warning)]/10 text-[var(--warning)]";
      case "completed":
        return "bg-[var(--chart-3)] text-[var(--chart-4)]";
      case "cancelled":
        return "bg-[var(--destructive)]/10 text-[var(--destructive)]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie os agendamentos do seu salão
            </p>
          </div>
          <Button onClick={handleCreateAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Estatísticas */}
        <AppointmentStats
          totalAppointments={appointmentsQuery.data?.length || 0}
          pendingAppointments={
            appointmentsQuery.data?.filter(apt => apt.status === "pending")
              .length || 0
          }
          confirmedAppointments={
            appointmentsQuery.data?.filter(apt => apt.status === "confirmed")
              .length || 0
          }
          completedAppointments={
            appointmentsQuery.data?.filter(apt => apt.status === "completed")
              .length || 0
          }
          cancelledAppointments={
            appointmentsQuery.data?.filter(apt => apt.status === "cancelled")
              .length || 0
          }
          selectedDate={selectedDate}
          viewMode={viewMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Calendário e Filtros */}
          <div className="lg:col-span-1 space-y-6">
            <CalendarPicker
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointmentCounts={appointmentCounts}
            />

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca */}
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Cliente, serviço ou especialista..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por status */}
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Modo de visualização */}
                <div>
                  <Label>Visualização</Label>
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant={viewMode === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("day")}
                      className="flex-1"
                    >
                      Dia
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                      className="flex-1"
                    >
                      Semana
                    </Button>
                    <Button
                      variant={viewMode === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                      className="flex-1"
                    >
                      Mês
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header da lista */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {viewMode === "day" &&
                    `Agendamentos de ${selectedDate.toLocaleDateString("pt-BR")}`}
                  {viewMode === "week" && "Agendamentos da Semana"}
                  {viewMode === "month" &&
                    `Agendamentos de ${selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredAppointments.length} agendamento
                  {filteredAppointments.length !== 1 ? "s" : ""} encontrado
                  {filteredAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Lista de agendamentos */}
            {appointmentsQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={`skeleton-loading-${Date.now()}-${i}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhum agendamento encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {appointmentsQuery.data?.length === 0
                      ? "Não há agendamentos para este período"
                      : "Nenhum agendamento corresponde aos filtros aplicados"}
                  </p>
                  <Button onClick={handleCreateAppointment} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Agendamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAppointments
                  .sort((a, b) => {
                    // Ordenar por data e horário
                    const dateA = new Date(a.appointmentDate).getTime();
                    const dateB = new Date(b.appointmentDate).getTime();
                    if (dateA !== dateB) return dateA - dateB;
                    return a.appointmentTime.localeCompare(b.appointmentTime);
                  })
                  .map(appointment => (
                    <Card
                      key={appointment.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Header do agendamento */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getStatusColor(
                                    appointment.status || "pending"
                                  )}
                                >
                                  {getStatusLabel(
                                    appointment.status || "pending"
                                  )}
                                </Badge>
                                <span className="text-lg font-semibold">
                                  {appointment.appointmentTime}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Botões de ação rápida */}
                                {(appointment.status === "pending" ||
                                  appointment.status === "confirmed") && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleQuickComplete(appointment.id)
                                        }
                                        className="text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)]/10"
                                        disabled={
                                          completeAppointmentMutation.isPending
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleQuickCancel(appointment.id)
                                        }
                                        className="text-[var(--destructive)] border-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                                        disabled={
                                          cancelAppointmentMutation.isPending
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-label="Menu de opções"
                                      >
                                        <title>Menu de opções</title>
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="12" cy="5" r="2" />
                                        <circle cx="12" cy="19" r="2" />
                                      </svg>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditAppointment(appointment)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteAppointment(appointment.id)
                                      }
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Informações do agendamento */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {appointment.client?.name}
                                  </p>
                                  {appointment.client?.phone && (
                                    <p className="text-muted-foreground">
                                      {appointment.client.phone}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Scissors className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {appointment.service?.name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {appointment.service?.duration}min • R${" "}
                                    {appointment.service?.price}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {appointment.specialist?.name}
                                  </p>
                                  {appointment.specialist?.specialty && (
                                    <p className="text-muted-foreground">
                                      {appointment.specialist.specialty}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Data (apenas se não for vista diária) */}
                            {viewMode !== "day" && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    appointment.appointmentDate
                                  ).toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            )}

                            {/* Observações */}
                            {appointment.notes && (
                              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                <strong>Obs:</strong> {appointment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de agendamento */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          appointment={
            editingAppointment
              ? {
                ...editingAppointment,
                status: editingAppointment.status || "pending",
                notes: editingAppointment.notes || undefined,
              }
              : undefined
          }
          initialDate={selectedDate}
        />
      </div>
    </DashboardLayout>
  );
}
