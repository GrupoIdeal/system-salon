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

export function AppointmentStats({
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    selectedDate,
    viewMode,
}: AppointmentStatsProps) {
    const getViewModeLabel = () => {
        switch (viewMode) {
            case "day":
                return `hoje (${selectedDate.toLocaleDateString('pt-BR')})`;
            case "week":
                return "esta semana";
            case "month":
                return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            default:
                return "período";
        }
    };

    const completionRate = totalAppointments > 0
        ? Math.round((completedAppointments / totalAppointments) * 100)
        : 0;

    const cancellationRate = totalAppointments > 0
        ? Math.round((cancelledAppointments / totalAppointments) * 100)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total de Agendamentos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAppointments}</div>
                    <p className="text-xs text-muted-foreground">
                        agendamentos {getViewModeLabel()}
                    </p>
                </CardContent>
            </Card>

            {/* Agendamentos Confirmados */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                    <Clock className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{confirmedAppointments}</div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            {pendingAppointments} pendentes
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Taxa de Conclusão */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{completedAppointments}</div>
                    <p className="text-xs text-muted-foreground">
                        {completionRate}% de taxa de conclusão
                    </p>
                </CardContent>
            </Card>

            {/* Cancelamentos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                    <Users className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{cancelledAppointments}</div>
                    <p className="text-xs text-muted-foreground">
                        {cancellationRate}% de cancelamento
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
