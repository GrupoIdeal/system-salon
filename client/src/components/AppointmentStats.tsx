import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Users } from "lucide-react";

interface AppointmentStatsProps {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  selectedDate: Date;
  viewMode: "day" | "week" | "month";
}

// memo: evita re-render quando as props não mudam
// (esse componente é chamado toda vez que o pai re-renderiza)
export const AppointmentStats = memo(function AppointmentStats({
  totalAppointments,
  pendingAppointments,
  confirmedAppointments,
  completedAppointments,
  cancelledAppointments,
  selectedDate,
  viewMode,
}: AppointmentStatsProps) {
  // useMemo: só recalcula rótulo e taxas quando as props relevantes mudarem
  const viewModeLabel = useMemo(() => {
    switch (viewMode) {
      case "day":
        return `hoje (${selectedDate.toLocaleDateString("pt-BR")})`;
      case "week":
        return "esta semana";
      case "month":
        return selectedDate.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
      default:
        return "período";
    }
  }, [viewMode, selectedDate]);

  const { completionRate, cancellationRate } = useMemo(
    () => ({
      completionRate:
        totalAppointments > 0
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0,
      cancellationRate:
        totalAppointments > 0
          ? Math.round((cancelledAppointments / totalAppointments) * 100)
          : 0,
    }),
    [totalAppointments, completedAppointments, cancelledAppointments]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Agendamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Calendar className="h-4 w-4 text-[var(--muted-foreground)]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAppointments}</div>
          <p className="text-xs text-[var(--muted-foreground)]">
            agendamentos {viewModeLabel}
          </p>
        </CardContent>
      </Card>

      {/* Agendamentos Confirmados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          <Clock className="h-4 w-4 text-[var(--success)]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--success)]">
            {confirmedAppointments}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-[var(--warning)]/10 text-[var(--warning)] text-xs"
            >
              {pendingAppointments} pendentes
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Conclusão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--primary)]">
            {completedAppointments}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {completionRate}% de taxa de conclusão
          </p>
        </CardContent>
      </Card>

      {/* Cancelamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
          <Users className="h-4 w-4 text-[var(--destructive)]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[var(--destructive)]">
            {cancelledAppointments}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {cancellationRate}% de cancelamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
