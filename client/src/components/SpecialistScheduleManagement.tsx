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

// Nomes dos dias da semana (0=Dom ... 6=Sáb) — usado no lugar do campo
// 'dayName' que não existe no tipo WorkingHours vindo do servidor
const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface SpecialistScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  specialistId?: string;
  editingSpecialist?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    photo?: string | null;
    specialty?: string | null;
    bio?: string | null;
  } | null;
  onSave?: () => void;
}

export function SpecialistScheduleManagement({
  isOpen,
  onClose,
  specialistId,
  editingSpecialist,
  onSave,
}: SpecialistScheduleProps) {
  const [selectedSpecialist, setSelectedSpecialist] = useState<
    string | undefined
  >(specialistId || undefined);
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [localPhoto, setLocalPhoto] = useState<string | undefined>(undefined);
  const [localSpecialty, setLocalSpecialty] = useState("");
  const [localBio, setLocalBio] = useState("");

  useEffect(() => {
    if (editingSpecialist) {
      setSelectedSpecialist(editingSpecialist.id);
      setLocalName(editingSpecialist.name || "");
      setLocalEmail(editingSpecialist.email || "");
      setLocalPhone(editingSpecialist.phone || "");
      setLocalPhoto(editingSpecialist.photo || undefined);
      setLocalSpecialty(editingSpecialist.specialty || "");
      setLocalBio(editingSpecialist.bio || "");
    }
  }, [editingSpecialist]);

  const specialistsQuery = trpc.specialists.list.useQuery();

  const scheduleQuery = trpc.schedule.getSpecialistSchedule.useQuery(
    { specialistId: selectedSpecialist || "" },
    { enabled: !!selectedSpecialist }
  );

  const utils = trpc.useContext();

  // Draft local para editar agenda (alterações só serão aplicadas ao clicar em Salvar)
  const [scheduleDraft, setScheduleDraft] = useState<Omit<
    import("/Users/ronnysenna/Projetos/system-salon/server/specialist-schedule").SpecialistSchedule,
    "specialistId"
  > | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar draft quando o schedule for carregado ou quando mudarmos de especialista
  useEffect(() => {
    if (scheduleQuery.data) {
      // clonar profundamente
      const cloned = JSON.parse(
        JSON.stringify({
          timeSlotDuration: scheduleQuery.data.timeSlotDuration,
          bufferTime: scheduleQuery.data.bufferTime,
          allowBookingDaysInAdvance:
            scheduleQuery.data.allowBookingDaysInAdvance,
          minimumNoticeHours: scheduleQuery.data.minimumNoticeHours,
          autoConfirmBookings: scheduleQuery.data.autoConfirmBookings,
          allowOnlineBooking: scheduleQuery.data.allowOnlineBooking,
          workingHours: scheduleQuery.data.workingHours.map((wh: any) => ({
            ...wh,
          })),
          customUnavailableDates:
            scheduleQuery.data.customUnavailableDates || [],
        })
      );
      setScheduleDraft(cloned);
    } else {
      setScheduleDraft(null);
    }
  }, [scheduleQuery.data]);

  const specialistUpdate = trpc.specialists.update.useMutation({
    onSuccess: () => {
      toast.success("Especialista atualizado com sucesso!");
      utils.specialists.list.invalidate();
      if (selectedSpecialist) {
        utils.schedule.getSpecialistSchedule.invalidate({
          specialistId: selectedSpecialist,
        });
      }
      if (onSave) onSave();
    },
    onError: error => {
      toast.error(`Erro ao atualizar especialista: ${error.message}`);
    },
  });

  const handleSelectSpecialist = async (value: string) => {
    const prev = selectedSpecialist;
    if (prev) {
      try {
        await utils.schedule.getSpecialistSchedule.cancel({
          specialistId: prev,
        });
      } catch (e) {
        // ignore
      }
      utils.schedule.getSpecialistSchedule.invalidate({ specialistId: prev });
    }

    setSelectedSpecialist(value || undefined);
  };

  const updateScheduleMutation =
    trpc.schedule.updateSpecialistSchedule.useMutation({
      onSuccess: () => {
        toast.success("Configurações atualizadas com sucesso!");
        if (selectedSpecialist) {
          utils.schedule.getSpecialistSchedule.invalidate({
            specialistId: selectedSpecialist,
          });
        }
      },
      onError: error => {
        toast.error(`Erro: ${error.message}`);
      },
    });

  // Mutation para upload de imagens (Cloudinary via servidor)
  const imageUploadMutation = trpc.images.upload.useMutation();

  // Nota: updateWorkingHours mutation não será usada mais para updates imediatos.

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

  // Agora atualizamos apenas o draft local e aplicamos no salvar
  const handleScheduleUpdate = (field: string, value: unknown) => {
    if (!scheduleDraft) return;
    setScheduleDraft(prev => {
      if (!prev) return prev;
      const copy: any = { ...prev };
      switch (field) {
        case "timeSlotDuration":
        case "bufferTime":
        case "allowBookingDaysInAdvance":
        case "minimumNoticeHours":
          copy[field] =
            typeof value === "number" ? value : parseInt(String(value));
          break;
        case "autoConfirmBookings":
        case "allowOnlineBooking":
          copy[field] = Boolean(value);
          break;
        default:
          break;
      }
      return copy;
    });
  };

  const handleWorkingHoursUpdate = (
    dayOfWeek: number,
    field: string,
    value: unknown
  ) => {
    if (!scheduleDraft) return;
    setScheduleDraft(prev => {
      if (!prev) return prev;
      const newWH = (prev.workingHours || []).map((wh: any) =>
        wh.dayOfWeek === dayOfWeek ? { ...wh } : wh
      );
      const idx = newWH.findIndex((w: any) => w.dayOfWeek === dayOfWeek);
      if (idx === -1) return prev;
      const updated = { ...newWH[idx] };
      switch (field) {
        case "isWorking":
          updated.isWorking = Boolean(value);
          break;
        case "startTime":
          updated.startTime = String(value) || "";
          break;
        case "endTime":
          updated.endTime = String(value) || "";
          break;
        case "breakStartTime":
          updated.breakStartTime = String(value) || "";
          break;
        case "breakEndTime":
          updated.breakEndTime = String(value) || "";
          break;
        default:
          break;
      }
      newWH[idx] = updated;
      return { ...prev, workingHours: newWH };
    });
  };

  const handleAddUnavailableDate = () => {
    if (!newUnavailableDate || !scheduleDraft) return;
    const dateObj = new Date(newUnavailableDate);
    setScheduleDraft(prev => {
      if (!prev) return prev;
      const arr = prev.customUnavailableDates
        ? [...prev.customUnavailableDates]
        : [];
      arr.push(dateObj);
      return { ...prev, customUnavailableDates: arr };
    });
  };

  const handleRemoveUnavailableDate = (dateString: string) => {
    if (!scheduleDraft) return;
    setScheduleDraft(prev => {
      if (!prev) return prev;
      const newArr = (prev.customUnavailableDates || []).filter(
        (d: any) =>
          new Date(d).toDateString() !== new Date(dateString).toDateString()
      );
      return { ...prev, customUnavailableDates: newArr };
    });
  };

  const handleLocalPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setLocalPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Primeiro, atualizar dados do especialista (se estiver em modo edição)
      if (editingSpecialist) {
        // construir payload sem reenviar foto grande se não foi alterada
        const updateData: Record<string, unknown> = {
          name: localName,
          email: localEmail,
          phone: localPhone,
          specialty: localSpecialty,
          bio: localBio,
        };

        // somente incluir photo se houver uma nova foto diferente da existente
        if (localPhoto && localPhoto !== editingSpecialist.photo) {
          // Se for data URL (base64), fazer upload pelo servidor para Cloudinary
          if (
            typeof localPhoto === "string" &&
            localPhoto.startsWith("data:")
          ) {
            // upload via mutation
            const res = await imageUploadMutation.mutateAsync({
              base64: localPhoto,
            });
            updateData.photo = res.url;
          } else {
            // já é uma URL (não base64) - enviar diretamente
            updateData.photo = localPhoto;
          }
        }

        // cast para any para evitar erro de tipagem do TypeScript aqui (o objeto é parcial)
        await specialistUpdate.mutateAsync({
          id: editingSpecialist.id,
          data: updateData as any,
        });
      }

      // Em seguida, aplicar alterações de schedule (se houver um especialista selecionado)
      if (selectedSpecialist && scheduleDraft) {
        // normalizar custom dates para Date[]
        const payload = {
          specialistId: selectedSpecialist,
          timeSlotDuration: scheduleDraft.timeSlotDuration,
          bufferTime: scheduleDraft.bufferTime,
          allowBookingDaysInAdvance: scheduleDraft.allowBookingDaysInAdvance,
          minimumNoticeHours: scheduleDraft.minimumNoticeHours,
          autoConfirmBookings: scheduleDraft.autoConfirmBookings,
          allowOnlineBooking: scheduleDraft.allowOnlineBooking,
          // enviar apenas campos esperados pelo servidor
          workingHours: (scheduleDraft.workingHours || []).map((wh: any) => ({
            dayOfWeek: wh.dayOfWeek,
            isWorking: !!wh.isWorking,
            startTime: wh.startTime || undefined,
            endTime: wh.endTime || undefined,
            breakStartTime: wh.breakStartTime || undefined,
            breakEndTime: wh.breakEndTime || undefined,
          })),
          // enviar datas como strings ISO
          customUnavailableDates: (
            scheduleDraft.customUnavailableDates || []
          ).map((d: any) =>
            d instanceof Date ? d.toISOString() : new Date(d).toISOString()
          ),
        };

        await updateScheduleMutation.mutateAsync(payload as any);
      }

      toast.success("Alterações salvas com sucesso!");
      if (onSave) onSave();
      onClose();
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err?.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialist">Especialista</Label>
              <Select
                value={selectedSpecialist ?? ""}
                onValueChange={handleSelectSpecialist}
                disabled={!!editingSpecialist}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um especialista" />
                </SelectTrigger>
                <SelectContent>
                  {specialistsQuery.data?.map(
                    (specialist: { id: string; name: string }) => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">{specialist.name}</span>
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {editingSpecialist && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Especialista</CardTitle>
                  <CardDescription>
                    Altere foto, nome, contato e bio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-4">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalPhotoChange}
                        className="hidden"
                      />
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-100 to-slate-100 flex items-center justify-center border-2 border-white shadow overflow-hidden">
                        {localPhoto ? (
                          <img
                            src={localPhoto}
                            alt="Foto"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                    </label>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm block">Nome</label>
                        <Input
                          value={localName}
                          onChange={e => setLocalName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm block">Especialidade</label>
                        <Input
                          value={localSpecialty}
                          onChange={e => setLocalSpecialty(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm block">Telefone</label>
                        <Input
                          value={localPhone}
                          onChange={e => setLocalPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm block">Email</label>
                        <Input
                          type="email"
                          value={localEmail}
                          onChange={e => setLocalEmail(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm block">Bio</label>
                        <textarea
                          className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 mt-1"
                          value={localBio}
                          onChange={e => setLocalBio(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedSpecialist && scheduleQuery.data ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                      <Settings className="h-5 w-5 text-[var(--primary)]" />
                      Configurações Gerais - {selectedSpecialistName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeSlotDuration">
                          Duração do Slot (min)
                        </Label>
                        <Select
                          value={
                            scheduleDraft?.timeSlotDuration.toString() || ""
                          }
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
                          value={scheduleDraft?.bufferTime || ""}
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
                          value={scheduleDraft?.allowBookingDaysInAdvance || ""}
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
                          value={scheduleDraft?.minimumNoticeHours || ""}
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
                          checked={scheduleDraft?.autoConfirmBookings || false}
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
                          checked={scheduleDraft?.allowOnlineBooking || false}
                          onCheckedChange={checked =>
                            handleScheduleUpdate("allowOnlineBooking", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                    {/* Table visível apenas em sm+ */}
                    <div className="hidden sm:block">
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
                          {scheduleDraft?.workingHours.map(day => (
                            <TableRow key={day.dayOfWeek}>
                              <TableCell className="font-medium break-words max-w-[120px]">
                                {DAY_NAMES[day.dayOfWeek]}
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
                                  aria-label={`Trabalha ${DAY_NAMES[day.dayOfWeek]}`}
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
                                  aria-label={`Início ${DAY_NAMES[day.dayOfWeek]}`}
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
                                  aria-label={`Fim ${DAY_NAMES[day.dayOfWeek]}`}
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
                                  aria-label={`Início pausa ${DAY_NAMES[day.dayOfWeek]}`}
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
                                  aria-label={`Fim pausa ${DAY_NAMES[day.dayOfWeek]}`}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile: empilhar os dias para telas pequenas */}
                    <div className="sm:hidden mt-3">
                      {scheduleDraft?.workingHours.map(day => (
                        <div
                          key={day.dayOfWeek}
                          className="p-3 border rounded mb-2 bg-white"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm break-words">
                              {DAY_NAMES[day.dayOfWeek]}
                            </div>
                            <div>
                              <label className="flex items-center gap-2">
                                <span className="sr-only">
                                  Trabalha {DAY_NAMES[day.dayOfWeek]}
                                </span>
                                <Switch
                                  checked={day.isWorking}
                                  onCheckedChange={checked =>
                                    handleWorkingHoursUpdate(
                                      day.dayOfWeek,
                                      "isWorking",
                                      checked
                                    )
                                  }
                                  aria-checked={day.isWorking}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`start-${day.dayOfWeek}`}
                                className="text-xs w-24"
                              >
                                Início
                              </label>
                              <Input
                                id={`start-${day.dayOfWeek}`}
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
                                className="w-full"
                                aria-label={`Início ${DAY_NAMES[day.dayOfWeek]}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`end-${day.dayOfWeek}`}
                                className="text-xs w-24"
                              >
                                Fim
                              </label>
                              <Input
                                id={`end-${day.dayOfWeek}`}
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
                                className="w-full"
                                aria-label={`Fim ${DAY_NAMES[day.dayOfWeek]}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`break-${day.dayOfWeek}`}
                                className="text-xs w-24"
                              >
                                Pausa
                              </label>
                              <Input
                                id={`break-${day.dayOfWeek}`}
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
                                className="w-full"
                                aria-label={`Início pausa ${DAY_NAMES[day.dayOfWeek]}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`breakend-${day.dayOfWeek}`}
                                className="text-xs w-24"
                              >
                                Fim pausa
                              </label>
                              <Input
                                id={`breakend-${day.dayOfWeek}`}
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
                                className="w-full"
                                aria-label={`Fim pausa ${DAY_NAMES[day.dayOfWeek]}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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

                    {(scheduleDraft?.customUnavailableDates?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Datas Cadastradas:
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {scheduleDraft!.customUnavailableDates.map((d, idx) => {
                            const raw = d instanceof Date ? d.toISOString() : String(d);
                            const dateStr = raw.split("T")[0];
                            const dateFormatted = new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR");
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[var(--destructive)]" />
                                  <span className="text-sm">
                                    {dateFormatted}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRemoveUnavailableDate(dateStr)
                                  }
                                  disabled={
                                    removeUnavailableDateMutation.isPending
                                  }
                                  aria-label={`Remover ${dateFormatted}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
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

                <Card className="bg-[var(--chart-1)] border-[var(--border)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                      <AlertCircle className="h-5 w-5" />
                      Resumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <strong>Slots:</strong> {scheduleDraft?.timeSlotDuration}{" "}
                      min
                    </p>
                    <p>
                      <strong>Intervalo:</strong> {scheduleDraft?.bufferTime}{" "}
                      min
                    </p>
                    <p>
                      <strong>Agendamento até:</strong>{" "}
                      {scheduleDraft?.allowBookingDaysInAdvance} dias
                    </p>
                    <div className="pt-2 border-t border-[var(--sidebar-border)]">
                      <p className="text-xs text-muted-foreground">
                        Dias de trabalho:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {scheduleDraft?.workingHours
                          .filter((d: { isWorking: boolean }) => d.isWorking)
                          .map(d => (
                            <Badge
                              key={d.dayOfWeek}
                              variant="outline"
                              className="text-xs"
                            >
                              {DAY_NAMES[d.dayOfWeek]}: {d.startTime} -{" "}
                              {d.endTime}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Selecione um especialista</p>
              </div>
            )}
          </div>
          <aside className="md:col-span-1 space-y-6">
            {selectedSpecialist && scheduleQuery.data && (
              <>
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

                    {(scheduleDraft?.customUnavailableDates?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Datas Cadastradas:
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {scheduleDraft!.customUnavailableDates.map((d, idx) => {
                            const raw = d instanceof Date ? d.toISOString() : String(d);
                            const dateStr = raw.split("T")[0];
                            const dateFormatted = new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR");
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[var(--destructive)]" />
                                  <span className="text-sm">
                                    {dateFormatted}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRemoveUnavailableDate(dateStr)
                                  }
                                  disabled={
                                    removeUnavailableDateMutation.isPending
                                  }
                                  aria-label={`Remover ${dateFormatted}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
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

                <Card className="bg-[var(--chart-1)] border-[var(--border)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                      <AlertCircle className="h-5 w-5" />
                      Resumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <strong>Slots:</strong> {scheduleDraft?.timeSlotDuration}{" "}
                      min
                    </p>
                    <p>
                      <strong>Intervalo:</strong> {scheduleDraft?.bufferTime}{" "}
                      min
                    </p>
                    <p>
                      <strong>Agendamento até:</strong>{" "}
                      {scheduleDraft?.allowBookingDaysInAdvance} dias
                    </p>
                    <div className="pt-2 border-t border-[var(--sidebar-border)]">
                      <p className="text-xs text-muted-foreground">
                        Dias de trabalho:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {scheduleDraft?.workingHours
                          .filter((d: { isWorking: boolean }) => d.isWorking)
                          .map(d => (
                            <Badge
                              key={d.dayOfWeek}
                              variant="outline"
                              className="text-xs"
                            >
                              {DAY_NAMES[d.dayOfWeek]}: {d.startTime} -{" "}
                              {d.endTime}
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                handleSaveAll();
              }}
              disabled={isSaving}
              className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--chart-4)] text-[var(--primary-foreground)]"
            >
              <Save className="h-4 w-4 mr-2" />{" "}
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
