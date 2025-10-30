// Sistema de Configurações de Horário por Especialista - Frontend
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Switch } from "@/components/ui/switch";
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
    Clock,
    Calendar,
    Settings,
    Plus,
    Trash2,
    User,
    CheckCircle,
    XCircle,
    Coffee,
    AlertCircle,
    Save
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SpecialistScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    specialistId?: string;
}

export function SpecialistScheduleManagement({ isOpen, onClose, specialistId }: SpecialistScheduleProps) {
    const [selectedSpecialist, setSelectedSpecialist] = useState(specialistId || '');
    const [showAddUnavailableDate, setShowAddUnavailableDate] = useState(false);
    const [newUnavailableDate, setNewUnavailableDate] = useState('');

    const specialistsQuery = trpc.specialists.list.useQuery();

    const scheduleQuery = trpc.schedule.getSpecialistSchedule.useQuery(
        { specialistId: selectedSpecialist },
        { enabled: !!selectedSpecialist }
    );

    const updateScheduleMutation = trpc.schedule.updateSpecialistSchedule.useMutation({
        onSuccess: () => {
            toast.success("Configurações atualizadas com sucesso!");
            scheduleQuery.refetch();
        },
        onError: (error) => {
            toast.error(`Erro: ${error.message}`);
        },
    });

    const updateWorkingHoursMutation = trpc.schedule.updateWorkingHours.useMutation({
        onSuccess: () => {
            toast.success("Horário de trabalho atualizado!");
            scheduleQuery.refetch();
        },
        onError: (error) => {
            toast.error(`Erro: ${error.message}`);
        },
    });

    const addUnavailableDateMutation = trpc.schedule.addUnavailableDate.useMutation({
        onSuccess: () => {
            toast.success("Data indisponível adicionada!");
            scheduleQuery.refetch();
            setShowAddUnavailableDate(false);
            setNewUnavailableDate('');
        },
        onError: (error) => {
            toast.error(`Erro: ${error.message}`);
        },
    });

    const removeUnavailableDateMutation = trpc.schedule.removeUnavailableDate.useMutation({
        onSuccess: () => {
            toast.success("Data indisponível removida!");
            scheduleQuery.refetch();
        },
        onError: (error) => {
            toast.error(`Erro: ${error.message}`);
        },
    });

    const handleScheduleUpdate = (field: string, value: any) => {
        if (!selectedSpecialist) return;

        const updateData: any = { specialistId: selectedSpecialist };
        updateData[field] = value;

        updateScheduleMutation.mutate(updateData);
    };

    const handleWorkingHoursUpdate = (dayOfWeek: number, field: string, value: any) => {
        if (!selectedSpecialist) return;

        const currentDay = scheduleQuery.data?.workingHoursFormatted.find(wh => wh.dayOfWeek === dayOfWeek);
        if (!currentDay) return;

        const updateData: any = {
            specialistId: selectedSpecialist,
            dayOfWeek,
            isWorking: currentDay.isWorking,
            startTime: currentDay.startTime,
            endTime: currentDay.endTime,
            breakStartTime: currentDay.breakStartTime,
            breakEndTime: currentDay.breakEndTime,
        };

        updateData[field] = value;

        updateWorkingHoursMutation.mutate(updateData);
    };

    const handleAddUnavailableDate = () => {
        if (!selectedSpecialist || !newUnavailableDate) return;

        addUnavailableDateMutation.mutate({
            specialistId: selectedSpecialist,
            date: new Date(newUnavailableDate)
        });
    };

    const handleRemoveUnavailableDate = (dateString: string) => {
        if (!selectedSpecialist) return;

        removeUnavailableDateMutation.mutate({
            specialistId: selectedSpecialist,
            date: new Date(dateString)
        });
    };

    const selectedSpecialistName = specialistsQuery.data?.find(s => s.id === selectedSpecialist)?.name || '';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações de Horário
                    </DialogTitle>
                    <DialogDescription>
                        Configure horários de trabalho e preferências para cada especialista
                    </DialogDescription>
                </DialogHeader>

                {/* Seleção do Especialista */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="specialist">Especialista</Label>
                        <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um especialista" />
                            </SelectTrigger>
                            <SelectContent>
                                {specialistsQuery.data?.map((specialist: any) => (
                                    <SelectItem key={specialist.id} value={specialist.id}>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {specialist.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedSpecialist && scheduleQuery.data && (
                        <div className="space-y-6">
                            {/* Configurações Gerais */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Configurações Gerais - {selectedSpecialistName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="timeSlotDuration">Duração do Slot (minutos)</Label>
                                            <Select
                                                value={scheduleQuery.data.timeSlotDuration.toString()}
                                                onValueChange={(value) => handleScheduleUpdate('timeSlotDuration', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 minutos</SelectItem>
                                                    <SelectItem value="30">30 minutos</SelectItem>
                                                    <SelectItem value="60">60 minutos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bufferTime">Tempo de Intervalo (minutos)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="60"
                                                value={scheduleQuery.data.bufferTime}
                                                onChange={(e) => handleScheduleUpdate('bufferTime', parseInt(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="allowBookingDaysInAdvance">Dias de Antecedência</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={scheduleQuery.data.allowBookingDaysInAdvance}
                                                onChange={(e) => handleScheduleUpdate('allowBookingDaysInAdvance', parseInt(e.target.value) || 30)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="minimumNoticeHours">Antecedência Mínima (horas)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="72"
                                                value={scheduleQuery.data.minimumNoticeHours}
                                                onChange={(e) => handleScheduleUpdate('minimumNoticeHours', parseInt(e.target.value) || 2)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="autoConfirmBookings">Confirmação Automática</Label>
                                            <Switch
                                                checked={scheduleQuery.data.autoConfirmBookings}
                                                onCheckedChange={(checked) => handleScheduleUpdate('autoConfirmBookings', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="allowOnlineBooking">Agendamento Online</Label>
                                            <Switch
                                                checked={scheduleQuery.data.allowOnlineBooking}
                                                onCheckedChange={(checked) => handleScheduleUpdate('allowOnlineBooking', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Horários de Trabalho */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Horários de Trabalho
                                    </CardTitle>
                                    <CardDescription>
                                        Configure os dias e horários de trabalho do especialista
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Dia da Semana</TableHead>
                                                <TableHead>Trabalhando</TableHead>
                                                <TableHead>Início</TableHead>
                                                <TableHead>Fim</TableHead>
                                                <TableHead>Pausa</TableHead>
                                                <TableHead>Fim da Pausa</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {scheduleQuery.data.workingHoursFormatted.map((day: any) => (
                                                <TableRow key={day.dayOfWeek}>
                                                    <TableCell className="font-medium">{day.dayName}</TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            checked={day.isWorking}
                                                            onCheckedChange={(checked) => handleWorkingHoursUpdate(day.dayOfWeek, 'isWorking', checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="time"
                                                            value={day.startTime || ''}
                                                            onChange={(e) => handleWorkingHoursUpdate(day.dayOfWeek, 'startTime', e.target.value)}
                                                            disabled={!day.isWorking}
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="time"
                                                            value={day.endTime || ''}
                                                            onChange={(e) => handleWorkingHoursUpdate(day.dayOfWeek, 'endTime', e.target.value)}
                                                            disabled={!day.isWorking}
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="time"
                                                            value={day.breakStartTime || ''}
                                                            onChange={(e) => handleWorkingHoursUpdate(day.dayOfWeek, 'breakStartTime', e.target.value)}
                                                            disabled={!day.isWorking}
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="time"
                                                            value={day.breakEndTime || ''}
                                                            onChange={(e) => handleWorkingHoursUpdate(day.dayOfWeek, 'breakEndTime', e.target.value)}
                                                            disabled={!day.isWorking}
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Datas Indisponíveis */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Datas Indisponíveis
                                    </CardTitle>
                                    <CardDescription>
                                        Gerencie férias, feriados e outras datas em que o especialista não estará disponível
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={newUnavailableDate}
                                            onChange={(e) => setNewUnavailableDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleAddUnavailableDate}
                                            disabled={!newUnavailableDate || addUnavailableDateMutation.isLoading}
                                            size="sm"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar
                                        </Button>
                                    </div>

                                    {scheduleQuery.data.customUnavailableDatesFormatted.length > 0 ? (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Datas Cadastradas:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {scheduleQuery.data.customUnavailableDatesFormatted.map((dateInfo: any) => (
                                                    <div key={dateInfo.date} className="flex items-center justify-between p-2 border rounded">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-red-500" />
                                                            <span className="text-sm">{dateInfo.dateFormatted}</span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleRemoveUnavailableDate(dateInfo.date)}
                                                            disabled={removeUnavailableDateMutation.isLoading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">
                                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Nenhuma data indisponível cadastrada</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resumo das Configurações */}
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800">
                                        <AlertCircle className="h-5 w-5" />
                                        Resumo das Configurações
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p><strong>Slots de:</strong> {scheduleQuery.data.timeSlotDuration} minutos</p>
                                            <p><strong>Intervalo entre agendamentos:</strong> {scheduleQuery.data.bufferTime} minutos</p>
                                            <p><strong>Agendamento até:</strong> {scheduleQuery.data.allowBookingDaysInAdvance} dias</p>
                                        </div>
                                        <div>
                                            <p><strong>Antecedência mínima:</strong> {scheduleQuery.data.minimumNoticeHours} horas</p>
                                            <p><strong>Confirmação automática:</strong> {scheduleQuery.data.autoConfirmBookings ? 'Sim' : 'Não'}</p>
                                            <p><strong>Agendamento online:</strong> {scheduleQuery.data.allowOnlineBooking ? 'Permitido' : 'Bloqueado'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-blue-200">
                                        <p><strong>Dias de trabalho:</strong></p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {scheduleQuery.data.workingHoursFormatted
                                                .filter((day: any) => day.isWorking)
                                                .map((day: any) => (
                                                    <Badge key={day.dayOfWeek} variant="outline" className="text-xs">
                                                        {day.dayName}: {day.startTime} - {day.endTime}
                                                        {day.hasBreak && ` (pausa: ${day.breakStartTime} - ${day.breakEndTime})`}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {!selectedSpecialist && (
                        <div className="text-center py-8 text-gray-500">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Selecione um especialista para configurar os horários</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
