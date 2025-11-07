// Sistema de Configurações de Horário por Especialista - Frontend
import { useState } from "react";
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
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
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
  AlertCircle,
  Save,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SpecialistScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  specialistId?: string;
}

export function SpecialistScheduleManagement({
  isOpen,
  onClose,
  specialistId,
}: SpecialistScheduleProps) {
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | undefined>(
    specialistId || undefined
  );
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  const specialistsQuery = trpc.specialists.list.useQuery();

  const scheduleQuery = trpc.schedule.getSpecialistSchedule.useQuery(
    { specialistId: selectedSpecialist || "" },
    { enabled: !!selectedSpecialist }
  );

  const utils = trpc.useContext();

  // Ao trocar de especialista, cancelar fetchs pendentes e invalidar cache
  const handleSelectSpecialist = async (value: string) => {
    const prev = selectedSpecialist;
    if (prev) {
      try {
        await utils.schedule.getSpecialistSchedule.cancel({ specialistId: prev });
      } catch (e) {
        // ignore
      }
      // garantir que não fique otimistic data do prev specialist
      utils.schedule.getSpecialistSchedule.invalidate({ specialistId: prev });
    }

    setSelectedSpecialist(value || undefined);
  };

  const updateScheduleMutation =
    trpc.schedule.updateSpecialistSchedule.useMutation({
      onSuccess: () => {
        toast.success("Configurações atualizadas com sucesso!");
        if (selectedSpecialist) {
          utils.schedule.getSpecialistSchedule.invalidate({ specialistId: selectedSpecialist });
        }
      },
      onError: error => {
        toast.error(`Erro: ${error.message}`);
      },
    });

  // Mutation com update otimista para atualizar imediatamente a UI
  const updateWorkingHoursMutation =
    trpc.schedule.updateWorkingHours.useMutation({
      onMutate: async vars => {
        // cancelar fetchs em andamento
        await utils.schedule.getSpecialistSchedule.cancel({ specialistId: vars.specialistId });

        // snapshot do estado anterior para rollback
        const previous = utils.schedule.getSpecialistSchedule.getData({ specialistId: vars.specialistId });

        // aplicar mudança otimista no cache
        utils.schedule.getSpecialistSchedule.setData({ specialistId: vars.specialistId }, old => {
          if (!old) return old;

          // Atualiza workingHours (array) e workingHoursFormatted (UI)
          const newWorkingHours = (old.workingHours || []).map(wh =>
            wh.dayOfWeek === vars.dayOfWeek ? {
              ...wh, ...{
                isWorking: vars.isWorking,
                startTime: vars.startTime ?? wh.startTime,
                endTime: vars.endTime ?? wh.endTime,
                breakStartTime: vars.breakStartTime ?? wh.breakStartTime,
                breakEndTime: vars.breakEndTime ?? wh.breakEndTime,
              }
            } : wh
          );

          const newWorkingHoursFormatted = (old.workingHoursFormatted || []).map(f =>
            f.dayOfWeek === vars.dayOfWeek ? {
              ...f, ...{
                isWorking: vars.isWorking,
                startTime: vars.startTime ?? f.startTime,
                endTime: vars.endTime ?? f.endTime,
                breakStartTime: vars.breakStartTime ?? f.breakStartTime,
                breakEndTime: vars.breakEndTime ?? f.breakEndTime,
              }
            } : f
          );

          return {
            ...old,
            workingHours: newWorkingHours,
            workingHoursFormatted: newWorkingHoursFormatted,
          } as typeof old;
        });

        return { previous };
      },
      onError: (err, vars, context) => {
        // rollback em caso de erro
        if (context?.previous) {
          utils.schedule.getSpecialistSchedule.setData({ specialistId: vars.specialistId }, context.previous);
        }
        toast.error(`Erro: ${err.message}`);
      },
      onSettled: (data, error, vars) => {
        // garantir dados atualizados do servidor
        if (vars?.specialistId) {
          utils.schedule.getSpecialistSchedule.invalidate({ specialistId: vars.specialistId });
        }
      },
      // Toast removido - será exibido apenas ao salvar todas as alterações
    });

  const addUnavailableDateMutation =
    trpc.schedule.addUnavailableDate.useMutation({
      onSuccess: () => {
        toast.success("Data indisponível adicionada!");
        scheduleQuery.refetch();
        setNewUnavailableDate("");
      },
      onError: error => {
        toast.error(`Erro: ${error.message}`);
      },
    });

  const removeUnavailableDateMutation =
    trpc.schedule.removeUnavailableDate.useMutation({
      onSuccess: () => {
        toast.success("Data indisponível removida!");
        scheduleQuery.refetch();
      },
      onError: error => {
        toast.error(`Erro: ${error.message}`);
      },
    });

  const handleScheduleUpdate = (field: string, value: unknown) => {
    const sid = selectedSpecialist;
    if (!sid) return;

    type UpdateSchedulePayload = {
      specialistId: string;
      timeSlotDuration?: number;
      bufferTime?: number;
      allowBookingDaysInAdvance?: number;
      minimumNoticeHours?: number;
      autoConfirmBookings?: boolean;
      allowOnlineBooking?: boolean;
    };

    const updateData: UpdateSchedulePayload = { specialistId: sid };

    switch (field) {
      case "timeSlotDuration":
        updateData.timeSlotDuration = typeof value === "number" ? value : parseInt(String(value));
        break;
      case "bufferTime":
        updateData.bufferTime = typeof value === "number" ? value : parseInt(String(value));
        break;
      case "allowBookingDaysInAdvance":
        updateData.allowBookingDaysInAdvance = typeof value === "number" ? value : parseInt(String(value));
        break;
      case "minimumNoticeHours":
        updateData.minimumNoticeHours = typeof value === "number" ? value : parseInt(String(value));
        break;
      case "autoConfirmBookings":
        updateData.autoConfirmBookings = Boolean(value);
        break;
      case "allowOnlineBooking":
        updateData.allowOnlineBooking = Boolean(value);
        break;
      default:
        // campo desconhecido — nada a fazer
        return;
    }

    updateScheduleMutation.mutate(updateData);
  };

  const handleWorkingHoursUpdate = (
    dayOfWeek: number,
    field: string,
    value: unknown
  ) => {
    const sid = selectedSpecialist;
    if (!sid) return;

    const cached = utils.schedule.getSpecialistSchedule.getData({ specialistId: sid }) || scheduleQuery.data;
    const currentDay = cached?.workingHoursFormatted.find((wh: { dayOfWeek: number }) => wh.dayOfWeek === dayOfWeek);
    if (!currentDay) return;

    type UpdateWorkingHoursPayload = {
      specialistId: string;
      dayOfWeek: number;
      isWorking: boolean;
      startTime?: string;
      endTime?: string;
      breakStartTime?: string;
      breakEndTime?: string;
    };

    const updateData: UpdateWorkingHoursPayload = {
      specialistId: sid,
      dayOfWeek,
      isWorking: currentDay.isWorking,
      startTime: currentDay.startTime ?? undefined,
      endTime: currentDay.endTime ?? undefined,
      breakStartTime: currentDay.breakStartTime ?? undefined,
      breakEndTime: currentDay.breakEndTime ?? undefined,
    };

    switch (field) {
      case "isWorking":
        updateData.isWorking = Boolean(value);
        break;
      case "startTime":
        updateData.startTime = String(value) || undefined;
        break;
      case "endTime":
        updateData.endTime = String(value) || undefined;
        break;
      case "breakStartTime":
        updateData.breakStartTime = String(value) || undefined;
        break;
      case "breakEndTime":
        updateData.breakEndTime = String(value) || undefined;
        break;
      default:
        return;
    }

    updateWorkingHoursMutation.mutate(updateData);
  };

  const handleAddUnavailableDate = () => {
    const sid = selectedSpecialist;
    if (!sid || !newUnavailableDate) return;

    addUnavailableDateMutation.mutate({
      specialistId: sid,
      date: new Date(newUnavailableDate),
    });
  };

  const handleRemoveUnavailableDate = (dateString: string) => {
    const sid = selectedSpecialist;
    if (!sid) return;

    removeUnavailableDateMutation.mutate({
      specialistId: sid,
      date: new Date(dateString),
    });
  };

  const selectedSpecialistName =
    specialistsQuery.data?.find(s => s.id === selectedSpecialist)?.name || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto mx-auto my-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[var(--primary)]" />
            Configurações de Horário
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure horários, feriados e preferências para cada especialista
          </DialogDescription>
        </DialogHeader>

        {/* Layout: conteúdo principal à esquerda, painel lateral à direita */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialist">Especialista</Label>
              <Select
                value={selectedSpecialist ?? ""}
                onValueChange={handleSelectSpecialist}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um especialista" />
                </SelectTrigger>
                <SelectContent>
                  {specialistsQuery.data?.map((specialist: { id: string; name: string }) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{specialist.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSpecialist && scheduleQuery.data ? (
              <div className="space-y-6">
                {/* Configurações Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                      <Settings className="h-5 w-5 text-[var(--primary)]" />
                      Configurações Gerais - {selectedSpecialistName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Campos compactos, estilo do projeto */}
                      <div className="space-y-2">
                        <Label htmlFor="timeSlotDuration">
                          Duração do Slot (min)
                        </Label>
                        <Select
                          value={scheduleQuery.data.timeSlotDuration.toString()}
                          onValueChange={value =>
                            handleScheduleUpdate(
                              "timeSlotDuration",
                              parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="60">60</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bufferTime">Intervalo (min)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={scheduleQuery.data.bufferTime}
                          onChange={e =>
                            handleScheduleUpdate(
                              "bufferTime",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allowBookingDaysInAdvance">
                          Dias de antecedência
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={scheduleQuery.data.allowBookingDaysInAdvance}
                          onChange={e =>
                            handleScheduleUpdate(
                              "allowBookingDaysInAdvance",
                              parseInt(e.target.value) || 30
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minimumNoticeHours">
                          Antecedência mínima (h)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="72"
                          value={scheduleQuery.data.minimumNoticeHours}
                          onChange={e =>
                            handleScheduleUpdate(
                              "minimumNoticeHours",
                              parseInt(e.target.value) || 2
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoConfirmBookings">
                          Confirmação automática
                        </Label>
                        <Switch
                          checked={scheduleQuery.data.autoConfirmBookings}
                          onCheckedChange={checked =>
                            handleScheduleUpdate("autoConfirmBookings", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowOnlineBooking">
                          Agendamento online
                        </Label>
                        <Switch
                          checked={scheduleQuery.data.allowOnlineBooking}
                          onCheckedChange={checked =>
                            handleScheduleUpdate("allowOnlineBooking", checked)
                          }
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
                      Configure dias, horário e pausas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dia</TableHead>
                          <TableHead>Trabalhando</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Fim</TableHead>
                          <TableHead>Pausa</TableHead>
                          <TableHead>Fim pausa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleQuery.data.workingHoursFormatted.map(
                          (day: { dayOfWeek: number; dayName: string; isWorking: boolean; startTime?: string | null; endTime?: string | null; breakStartTime?: string | null; breakEndTime?: string | null }) => (
                            <TableRow key={day.dayOfWeek}>
                              <TableCell className="font-medium">
                                {day.dayName}
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={day.isWorking}
                                  onCheckedChange={checked =>
                                    handleWorkingHoursUpdate(
                                      day.dayOfWeek,
                                      "isWorking",
                                      checked
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={day.startTime || ""}
                                  onChange={e =>
                                    handleWorkingHoursUpdate(
                                      day.dayOfWeek,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                  disabled={!day.isWorking}
                                  className="w-32"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={day.endTime || ""}
                                  onChange={e =>
                                    handleWorkingHoursUpdate(
                                      day.dayOfWeek,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                  disabled={!day.isWorking}
                                  className="w-32"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={day.breakStartTime || ""}
                                  onChange={e =>
                                    handleWorkingHoursUpdate(
                                      day.dayOfWeek,
                                      "breakStartTime",
                                      e.target.value
                                    )
                                  }
                                  disabled={!day.isWorking}
                                  className="w-32"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={day.breakEndTime || ""}
                                  onChange={e =>
                                    handleWorkingHoursUpdate(
                                      day.dayOfWeek,
                                      "breakEndTime",
                                      e.target.value
                                    )
                                  }
                                  disabled={!day.isWorking}
                                  className="w-32"
                                />
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um especialista para configurar os horários</p>
              </div>
            )}
          </div>

          {/* Painel lateral */}
          <aside className="md:col-span-1 space-y-4">
            {selectedSpecialist && scheduleQuery.data && (
              <>
                {/* Datas Indisponíveis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Datas Indisponíveis
                    </CardTitle>
                    <CardDescription>
                      Férias, feriados e bloqueios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={newUnavailableDate}
                        onChange={e => setNewUnavailableDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddUnavailableDate}
                        disabled={
                          !newUnavailableDate ||
                          addUnavailableDateMutation.isPending
                        }
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>

                    {scheduleQuery.data.customUnavailableDatesFormatted.length >
                      0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Datas Cadastradas:
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {scheduleQuery.data.customUnavailableDatesFormatted.map(
                            (dateInfo: { date: string; dateFormatted: string }) => (
                              <div
                                key={dateInfo.date}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[var(--destructive)]" />
                                  <span className="text-sm">
                                    {dateInfo.dateFormatted}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRemoveUnavailableDate(dateInfo.date)
                                  }
                                  disabled={
                                    removeUnavailableDateMutation.isPending
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Nenhuma data indisponível cadastrada
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resumo */}
                <Card className="bg-[var(--chart-1)] border-[var(--border)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                      <AlertCircle className="h-5 w-5" />
                      Resumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <strong>Slots:</strong>{" "}
                      {scheduleQuery.data.timeSlotDuration} min
                    </p>
                    <p>
                      <strong>Intervalo:</strong>{" "}
                      {scheduleQuery.data.bufferTime} min
                    </p>
                    <p>
                      <strong>Agendamento até:</strong>{" "}
                      {scheduleQuery.data.allowBookingDaysInAdvance} dias
                    </p>
                    <div className="pt-2 border-t border-[var(--sidebar-border)]">
                      <p className="text-xs text-muted-foreground">
                        Dias de trabalho:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {scheduleQuery.data.workingHoursFormatted
                          .filter((d: { isWorking: boolean }) => d.isWorking)
                          .map((d: { dayOfWeek: number; dayName: string; startTime?: string | null; endTime?: string | null }) => (
                            <Badge
                              key={d.dayOfWeek}
                              variant="outline"
                              className="text-xs"
                            >
                              {d.dayName}: {d.startTime} - {d.endTime}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </aside>
        </div>

        <DialogFooter className="pt-4">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                scheduleQuery.refetch();
                toast.success("Alterações salvas com sucesso!");
                // Fechar o modal após salvar
                onClose();
              }}
              className="bg-[var(--primary)] hover:bg-[var(--chart-4)] text-[var(--primary-foreground)]"
            >
              <Save className="h-4 w-4 mr-2" /> Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
