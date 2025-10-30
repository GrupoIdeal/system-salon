// Sistema de Relatórios Avançados - Frontend
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart3,
    TrendingUp,
    Users,
    Calendar,
    Download,
    DollarSign,
    Clock,
    Star,
    AlertTriangle,
    Target,
    Activity
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReportsManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReportsManagement({ isOpen, onClose }: ReportsManagementProps) {
    const [selectedReport, setSelectedReport] = useState<'stats' | 'specialists' | 'services' | 'clients' | 'daily'>('stats');
    const [dateFilter, setDateFilter] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
        endDate: new Date().toISOString().split('T')[0] // hoje
    });

    // Queries para os relatórios
    const statsQuery = trpc.reports.appointmentStats.useQuery({
        startDate: new Date(dateFilter.startDate),
        endDate: new Date(dateFilter.endDate)
    });

    const specialistPerformanceQuery = trpc.reports.specialistPerformance.useQuery({
        startDate: new Date(dateFilter.startDate),
        endDate: new Date(dateFilter.endDate)
    });

    const servicePopularityQuery = trpc.reports.servicePopularity.useQuery({
        startDate: new Date(dateFilter.startDate),
        endDate: new Date(dateFilter.endDate)
    });

    const clientAnalyticsQuery = trpc.reports.clientAnalytics.useQuery({
        startDate: new Date(dateFilter.startDate),
        endDate: new Date(dateFilter.endDate),
        riskThreshold: 70
    });

    const dailyReportQuery = trpc.reports.dailyReport.useQuery({
        date: new Date(dateFilter.endDate)
    });

    const exportCSVMutation = trpc.reports.exportCSV.useMutation({
        onSuccess: (result) => {
            // Criar e baixar arquivo CSV
            const blob = new Blob([result.content], { type: result.mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("Relatório exportado com sucesso!");
        },
        onError: (error) => {
            toast.error(`Erro ao exportar: ${error.message}`);
        }
    });

    const handleExport = (reportType: string, data: any) => {
        exportCSVMutation.mutate({ reportType: reportType as any, data });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Relatórios Avançados
                    </DialogTitle>
                    <DialogDescription>
                        Análises detalhadas e relatórios de performance do salão
                    </DialogDescription>
                </DialogHeader>

                {/* Filtros de Data */}
                <div className="flex gap-4 items-end border-b pb-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Data Inicial</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">Data Final</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                        />
                    </div>
                    <Button onClick={() => {
                        statsQuery.refetch();
                        specialistPerformanceQuery.refetch();
                        servicePopularityQuery.refetch();
                        clientAnalyticsQuery.refetch();
                    }}>
                        Aplicar Filtros
                    </Button>
                </div>

                {/* Tabs dos Relatórios */}
                <div className="flex space-x-1 border-b">
                    {[
                        { id: 'stats', label: 'Estatísticas Gerais', icon: BarChart3 },
                        { id: 'specialists', label: 'Performance', icon: Users },
                        { id: 'services', label: 'Serviços', icon: Star },
                        { id: 'clients', label: 'Clientes', icon: Target },
                        { id: 'daily', label: 'Diário', icon: Calendar }
                    ].map(({ id, label, icon: Icon }) => (
                        <Button
                            key={id}
                            variant={selectedReport === id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedReport(id as any)}
                            className="flex items-center gap-2"
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Estatísticas Gerais */}
                {selectedReport === 'stats' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Estatísticas Gerais</h3>
                            <Button
                                onClick={() => handleExport('appointments', statsQuery.data)}
                                disabled={!statsQuery.data || exportCSVMutation.isLoading}
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>

                        {statsQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : statsQuery.data ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statsQuery.data.total}</div>
                                        <p className="text-xs text-muted-foreground">No período selecionado</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Agendamentos Completados</CardTitle>
                                        <Activity className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{statsQuery.data.completed}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatPercentage((statsQuery.data.completed / statsQuery.data.total) * 100)} do total
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(statsQuery.data.revenue)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Apenas agendamentos completados</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(statsQuery.data.averageTicket)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Por agendamento completado</p>
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Status dos Agendamentos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Completados:</span>
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    {statsQuery.data.completed}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Cancelados:</span>
                                                <Badge variant="destructive">
                                                    {statsQuery.data.cancelled}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Confirmados:</span>
                                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                    {statsQuery.data.confirmed}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Pendentes:</span>
                                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                                    {statsQuery.data.pending}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>Erro ao carregar estatísticas</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Performance dos Especialistas */}
                {selectedReport === 'specialists' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Performance dos Especialistas</h3>
                            <Button
                                onClick={() => handleExport('specialists', specialistPerformanceQuery.data)}
                                disabled={!specialistPerformanceQuery.data || exportCSVMutation.isLoading}
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>

                        {specialistPerformanceQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : specialistPerformanceQuery.data && specialistPerformanceQuery.data.length > 0 ? (
                            <Table>
                                <TableCaption>
                                    Performance de {specialistPerformanceQuery.data.length} especialista(s)
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Especialista</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Completados</TableHead>
                                        <TableHead>Taxa de Conclusão</TableHead>
                                        <TableHead>Receita</TableHead>
                                        <TableHead>Ticket Médio</TableHead>
                                        <TableHead>Principais Serviços</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {specialistPerformanceQuery.data.map((specialist: any) => (
                                        <TableRow key={specialist.specialistId}>
                                            <TableCell className="font-medium">{specialist.specialistName}</TableCell>
                                            <TableCell>{specialist.totalAppointments}</TableCell>
                                            <TableCell className="text-green-600">{specialist.completedAppointments}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${specialist.completionRate >= 80 ? 'bg-green-500' :
                                                            specialist.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    {formatPercentage(specialist.completionRate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                {formatCurrency(specialist.revenue)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(specialist.averageTicket)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {specialist.topServices.slice(0, 2).map((service: any) => (
                                                        <div key={service.serviceId} className="text-xs">
                                                            <Badge variant="outline" className="text-xs">
                                                                {service.serviceName} ({service.count})
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum dado de performance encontrado</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Popularidade dos Serviços */}
                {selectedReport === 'services' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Popularidade dos Serviços</h3>
                            <Button
                                onClick={() => handleExport('services', servicePopularityQuery.data)}
                                disabled={!servicePopularityQuery.data || exportCSVMutation.isLoading}
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>

                        {servicePopularityQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : servicePopularityQuery.data && servicePopularityQuery.data.length > 0 ? (
                            <Table>
                                <TableCaption>
                                    Análise de {servicePopularityQuery.data.length} serviço(s)
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Serviço</TableHead>
                                        <TableHead>Total Agendamentos</TableHead>
                                        <TableHead>Completados</TableHead>
                                        <TableHead>Receita</TableHead>
                                        <TableHead>Ticket Médio</TableHead>
                                        <TableHead>Duração</TableHead>
                                        <TableHead>Horários Populares</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {servicePopularityQuery.data.map((service: any) => (
                                        <TableRow key={service.serviceId}>
                                            <TableCell className="font-medium">{service.serviceName}</TableCell>
                                            <TableCell>{service.totalBookings}</TableCell>
                                            <TableCell className="text-green-600">{service.completedBookings}</TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                {formatCurrency(service.revenue)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(service.averageTicket)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {service.duration}min
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {service.popularTimeSlots.slice(0, 3).map((slot: any) => (
                                                        <div key={slot.timeSlot} className="text-xs">
                                                            <Badge variant="outline" className="text-xs">
                                                                {slot.timeSlot} ({slot.count})
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum dado de serviços encontrado</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Análise de Clientes */}
                {selectedReport === 'clients' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Análise de Clientes</h3>
                            <Button
                                onClick={() => handleExport('clients', clientAnalyticsQuery.data?.all)}
                                disabled={!clientAnalyticsQuery.data || exportCSVMutation.isLoading}
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>

                        {clientAnalyticsQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : clientAnalyticsQuery.data ? (
                            <>
                                {/* Clientes de Alto Risco */}
                                {clientAnalyticsQuery.data.highRisk.length > 0 && (
                                    <Card className="border-red-200 bg-red-50">
                                        <CardHeader>
                                            <CardTitle className="text-red-800 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                Clientes com Risco de Abandono
                                            </CardTitle>
                                            <CardDescription>
                                                Clientes que podem estar prestes a parar de frequentar o salão
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {clientAnalyticsQuery.data.highRisk.slice(0, 5).map((client: any) => (
                                                    <div key={client.clientId} className="flex justify-between items-center p-2 bg-white rounded">
                                                        <div>
                                                            <span className="font-medium">{client.clientName}</span>
                                                            <p className="text-sm text-gray-600">
                                                                Última visita: {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('pt-BR') : 'Nunca'}
                                                            </p>
                                                        </div>
                                                        <Badge variant="destructive">
                                                            Risco: {client.riskScore.toFixed(0)}%
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Top Clientes */}
                                <Table>
                                    <TableCaption>
                                        Análise de {clientAnalyticsQuery.data.all.length} cliente(s)
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Total Agendamentos</TableHead>
                                            <TableHead>Completados</TableHead>
                                            <TableHead>Total Gasto</TableHead>
                                            <TableHead>Ticket Médio</TableHead>
                                            <TableHead>Frequência</TableHead>
                                            <TableHead>Última Visita</TableHead>
                                            <TableHead>Risco</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientAnalyticsQuery.data.all.slice(0, 10).map((client: any) => (
                                            <TableRow key={client.clientId}>
                                                <TableCell className="font-medium">{client.clientName}</TableCell>
                                                <TableCell>{client.totalAppointments}</TableCell>
                                                <TableCell className="text-green-600">{client.completedAppointments}</TableCell>
                                                <TableCell className="text-green-600 font-medium">
                                                    {formatCurrency(client.totalSpent)}
                                                </TableCell>
                                                <TableCell>{formatCurrency(client.averageTicket)}</TableCell>
                                                <TableCell>
                                                    {client.frequencyDays > 0 ? `${client.frequencyDays.toFixed(0)} dias` : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('pt-BR') : 'Nunca'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={client.riskScore >= 70 ? "destructive" : client.riskScore >= 40 ? "default" : "secondary"}>
                                                        {client.riskScore.toFixed(0)}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum dado de clientes encontrado</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Relatório Diário */}
                {selectedReport === 'daily' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Relatório Diário</h3>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                                    className="w-auto"
                                />
                                <Button onClick={() => dailyReportQuery.refetch()}>
                                    Atualizar
                                </Button>
                            </div>
                        </div>

                        {dailyReportQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : dailyReportQuery.data ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Agendamentos do Dia</CardTitle>
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{dailyReportQuery.data.totalAppointments}</div>
                                            <p className="text-xs text-muted-foreground">
                                                {dailyReportQuery.data.completedAppointments} completados
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Receita do Dia</CardTitle>
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(dailyReportQuery.data.revenue)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {dailyReportQuery.data.cancelledAppointments} cancelamentos
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Horários Mais Movimentados</CardTitle>
                                            <Clock className="h-4 w-4 text-blue-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-1">
                                                {dailyReportQuery.data.busyHours.slice(0, 3).map((hour: any) => (
                                                    <div key={hour.hour} className="flex justify-between text-sm">
                                                        <span>{hour.hour}</span>
                                                        <span className="font-medium">{hour.appointmentCount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Gráfico de horários movimentados */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Distribuição de Agendamentos por Horário</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {dailyReportQuery.data.busyHours.map((hour: any) => {
                                                const maxCount = Math.max(...dailyReportQuery.data.busyHours.map((h: any) => h.appointmentCount));
                                                const percentage = maxCount > 0 ? (hour.appointmentCount / maxCount) * 100 : 0;

                                                return (
                                                    <div key={hour.hour} className="flex items-center gap-4">
                                                        <div className="w-16 text-sm font-medium">{hour.hour}</div>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                                            <div
                                                                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="w-8 text.sm text-right">{hour.appointmentCount}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum dado encontrado para esta data</p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
