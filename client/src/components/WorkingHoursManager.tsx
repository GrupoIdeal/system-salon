import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Clock } from "lucide-react";

interface WorkingPeriod {
    start: string;
    end: string;
}

interface DaySchedule {
    enabled: boolean;
    periods: WorkingPeriod[];
    lunch?: {
        start: string;
        end: string;
    };
}

interface WorkingDays {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

interface WorkingHoursManagerProps {
    workingDays: WorkingDays;
    onChange: (workingDays: WorkingDays) => void;
}

const dayNames = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
};

const defaultWorkingDays: WorkingDays = {
    monday: { enabled: true, periods: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    tuesday: { enabled: true, periods: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    wednesday: { enabled: true, periods: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    thursday: { enabled: true, periods: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    friday: { enabled: true, periods: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
    saturday: { enabled: true, periods: [{ start: "08:00", end: "13:00" }] },
    sunday: { enabled: false, periods: [] },
};

export function WorkingHoursManager({ workingDays, onChange }: WorkingHoursManagerProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateDay = (day: keyof WorkingDays, daySchedule: DaySchedule) => {
        onChange({
            ...workingDays,
            [day]: daySchedule,
        });
    };

    const toggleDayEnabled = (day: keyof WorkingDays) => {
        const currentDay = workingDays[day];
        updateDay(day, {
            ...currentDay,
            enabled: !currentDay.enabled,
            periods: currentDay.enabled ? [] : [{ start: "08:00", end: "18:00" }],
        });
    };

    const addPeriod = (day: keyof WorkingDays) => {
        const currentDay = workingDays[day];
        updateDay(day, {
            ...currentDay,
            periods: [...currentDay.periods, { start: "08:00", end: "18:00" }],
        });
    };

    const removePeriod = (day: keyof WorkingDays, periodIndex: number) => {
        const currentDay = workingDays[day];
        updateDay(day, {
            ...currentDay,
            periods: currentDay.periods.filter((_, index) => index !== periodIndex),
        });
    };

    const updatePeriod = (day: keyof WorkingDays, periodIndex: number, field: 'start' | 'end', value: string) => {
        const currentDay = workingDays[day];
        const updatedPeriods = [...currentDay.periods];
        updatedPeriods[periodIndex] = {
            ...updatedPeriods[periodIndex],
            [field]: value,
        };
        updateDay(day, {
            ...currentDay,
            periods: updatedPeriods,
        });
    };

    const updateLunch = (day: keyof WorkingDays, field: 'start' | 'end', value: string) => {
        const currentDay = workingDays[day];
        updateDay(day, {
            ...currentDay,
            lunch: {
                start: field === 'start' ? value : currentDay.lunch?.start || "12:00",
                end: field === 'end' ? value : currentDay.lunch?.end || "13:00",
            },
        });
    };

    const removeLunch = (day: keyof WorkingDays) => {
        const currentDay = workingDays[day];
        updateDay(day, {
            ...currentDay,
            lunch: undefined,
        });
    };

    const addLunch = (day: keyof WorkingDays) => {
        const currentDay = workingDays[day];
        updateDay(day, {
            ...currentDay,
            lunch: { start: "12:00", end: "13:00" },
        });
    };

    const copyFromTemplate = () => {
        onChange(defaultWorkingDays);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <CardTitle>Horários de Trabalho</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyFromTemplate}
                        >
                            Usar Padrão
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "Recolher" : "Expandir"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6">
                    {Object.entries(workingDays).map(([dayKey, daySchedule]) => {
                        const day = dayKey as keyof WorkingDays;

                        return (
                            <div key={day} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={daySchedule.enabled}
                                            onCheckedChange={() => toggleDayEnabled(day)}
                                        />
                                        <Label className="font-medium">{dayNames[day]}</Label>
                                    </div>
                                </div>

                                {daySchedule.enabled && (
                                    <div className="ml-6 space-y-3">
                                        {/* Períodos de trabalho */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Períodos de trabalho:</Label>

                                            {daySchedule.periods.map((period: WorkingPeriod, periodIndex: number) => (
                                                <div key={`${dayKey}-period-${period.start}-${period.end}`} className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={period.start}
                                                        onChange={(e) => updatePeriod(day, periodIndex, 'start', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    <span className="text-muted-foreground">às</span>
                                                    <Input
                                                        type="time"
                                                        value={period.end}
                                                        onChange={(e) => updatePeriod(day, periodIndex, 'end', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    {daySchedule.periods.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removePeriod(day, periodIndex)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addPeriod(day)}
                                                className="text-sm"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Adicionar período
                                            </Button>
                                        </div>

                                        {/* Horário de almoço */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Horário de almoço (opcional):</Label>

                                            {daySchedule.lunch ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={daySchedule.lunch.start}
                                                        onChange={(e) => updateLunch(day, 'start', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    <span className="text-muted-foreground">às</span>
                                                    <Input
                                                        type="time"
                                                        value={daySchedule.lunch.end}
                                                        onChange={(e) => updateLunch(day, 'end', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeLunch(day)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addLunch(day)}
                                                    className="text-sm"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Adicionar almoço
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Separator />
                            </div>
                        );
                    })}
                </CardContent>
            )}
        </Card>
    );
}

// Tipo do schema do banco de dados
type DatabaseWorkingDays = Record<string, Array<{
    start: string;
    end: string;
    lunch?: { start: string; end: string };
}>>;

// Converte do tipo do componente para o tipo do banco
export function workingDaysToDatabase(workingDays: WorkingDays): DatabaseWorkingDays {
    const result: DatabaseWorkingDays = {};

    Object.entries(workingDays).forEach(([day, schedule]) => {
        if (schedule.enabled && schedule.periods.length > 0) {
            result[day] = schedule.periods.map((period: WorkingPeriod) => ({
                start: period.start,
                end: period.end,
                lunch: schedule.lunch
            }));
        }
    });

    return result;
}

// Converte do tipo do banco para o tipo do componente
export function workingDaysFromDatabase(dbWorkingDays: DatabaseWorkingDays | null): WorkingDays {
    if (!dbWorkingDays) return defaultWorkingDays;

    const result: WorkingDays = { ...defaultWorkingDays };

    Object.entries(result).forEach(([day]) => {
        const dayKey = day as keyof WorkingDays;
        if (dbWorkingDays[day] && dbWorkingDays[day].length > 0) {
            const periods = dbWorkingDays[day];
            result[dayKey] = {
                enabled: true,
                periods: periods.map(p => ({ start: p.start, end: p.end })),
                lunch: periods[0]?.lunch
            };
        } else {
            result[dayKey] = {
                enabled: false,
                periods: []
            };
        }
    });

    return result;
}

export { defaultWorkingDays };
export type { WorkingDays };
