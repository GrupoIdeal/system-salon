import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarPickerProps {
    selectedDate?: Date;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    appointmentCounts?: Record<string, number>; // Para mostrar quantos agendamentos por dia
}

export function CalendarPicker({
    selectedDate,
    onDateSelect,
    minDate = new Date(),
    maxDate,
    disabledDates = [],
    appointmentCounts = {},
}: CalendarPickerProps) {
    const [currentMonth, setCurrentMonth] = useState(
        selectedDate || new Date()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Calcular primeiro dia da semana do mês (0 = domingo)
    const startOfWeek = new Date(startOfMonth);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    // Calcular último dia da semana do mês
    const endOfWeek = new Date(endOfMonth);
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

    const days = [];
    const currentDay = new Date(startOfWeek);

    while (currentDay <= endOfWeek) {
        days.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
    }

    const isDateDisabled = (date: Date) => {
        // Antes da data mínima
        if (minDate && date < minDate) return true;

        // Depois da data máxima
        if (maxDate && date > maxDate) return true;

        // Em lista de datas desabilitadas
        return disabledDates.some(
            (disabledDate) =>
                disabledDate.toDateString() === date.toDateString()
        );
    };

    const isDateSelected = (date: Date) => {
        return selectedDate?.toDateString() === date.toDateString();
    };

    const isToday = (date: Date) => {
        return today.toDateString() === date.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth();
    };

    const getAppointmentCount = (date: Date) => {
        const dateKey = date.toISOString().split('T')[0];
        return appointmentCounts[dateKey] || 0;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5" />
                        Selecionar Data
                    </CardTitle>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonth('prev')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium min-w-[120px] text-center">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonth('next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="p-2 text-center text-xs font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                        const disabled = isDateDisabled(day);
                        const selected = isDateSelected(day);
                        const todayClass = isToday(day);
                        const currentMonthClass = isCurrentMonth(day);
                        const appointmentCount = getAppointmentCount(day);

                        return (
                            <div key={index} className="relative">
                                <Button
                                    variant={selected ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "w-full h-10 p-1 flex flex-col items-center justify-center relative",
                                        !currentMonthClass && "text-muted-foreground opacity-50",
                                        todayClass && !selected && "bg-blue-50 text-blue-700 border border-blue-200",
                                        selected && "bg-primary text-primary-foreground",
                                        disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => !disabled && onDateSelect(day)}
                                    disabled={disabled}
                                >
                                    <span className={cn(
                                        "text-sm",
                                        appointmentCount > 0 && "mb-1"
                                    )}>
                                        {day.getDate()}
                                    </span>

                                    {appointmentCount > 0 && (
                                        <Badge
                                            variant={selected ? "secondary" : "default"}
                                            className="absolute -bottom-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px]"
                                        >
                                            {appointmentCount > 9 ? "9+" : appointmentCount}
                                        </Badge>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* Legenda */}
                <div className="mt-4 pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                                <span>Hoje</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-primary rounded"></div>
                                <span>Selecionado</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge variant="default" className="h-3 w-3 p-0 text-xs">
                                    <span className="sr-only">Agendamentos</span>
                                </Badge>
                                <span>Com agendamentos</span>
                            </div>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="text-sm font-medium">
                            Data selecionada: {selectedDate.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
