// Página de Especialistas - CRUD
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Edit, Trash2, User2, Link, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { SpecialistScheduleManagement } from "@/components/SpecialistScheduleManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// WorkingHoursManager removed - now using SpecialistScheduleManagement

// SyncStatusIndicator removed - sync functionality no longer needed

export default function Specialists() {
  const nameId = useId();
  const specialtyId = useId();
  const phoneId = useId();
  const emailId = useId();
  const bioId = useId();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    photo: "",
    specialty: "",
    bio: "",
  });
  // workingDays removed - now handled by SpecialistScheduleManagement
  const [isEditing, setIsEditing] = useState(false);
  const [editingSpecialistId, setEditingSpecialistId] = useState<string | null>(
    null
  );
  const [showScheduleManagement, setShowScheduleManagement] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState(() => ({
    timeSlotDuration: 30,
    bufferTime: 0,
    allowBookingDaysInAdvance: 30,
    minimumNoticeHours: 2,
    autoConfirmBookings: true,
    allowOnlineBooking: true,
    workingHours: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isWorking: false,
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
    })),
  }));
  // Dia de origem para copiar horário para os outros dias (0=Dom .. 6=Sáb)
  const [copyFromDay, setCopyFromDay] = useState<number>(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [specialistToDelete, setSpecialistToDelete] = useState<string | null>(
    null
  );
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());

  const specialistsQuery = trpc.specialists.list.useQuery();
  const createMutation = trpc.specialists.create.useMutation({
    onSuccess: () => {
      // Backend aplica schedule de forma atômica quando enviado no payload
      specialistsQuery.refetch();
      toast.success("Especialista criado com sucesso");
      resetForm();
      setScheduleEnabled(false);
      // Reset draft para valores padrão
      setScheduleDraft({
        timeSlotDuration: 30,
        bufferTime: 0,
        allowBookingDaysInAdvance: 30,
        minimumNoticeHours: 2,
        autoConfirmBookings: true,
        allowOnlineBooking: true,
        workingHours: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          isWorking: false,
          startTime: "",
          endTime: "",
          breakStartTime: "",
          breakEndTime: "",
        })),
      });
    },
  });
  const updateMutation = trpc.specialists.update.useMutation({
    onSuccess: () => {
      specialistsQuery.refetch();
      resetForm();
      setIsEditing(false);
    },
  });
  const deleteMutation = trpc.specialists.delete.useMutation({
    onSuccess: () => {
      specialistsQuery.refetch();
      setIsDeleteDialogOpen(false);
      setSpecialistToDelete(null);
    },
  });

  // Função para resetar o formulário
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      photo: "",
      specialty: "",
      bio: "",
    });
    setIsEditing(false);
    setEditingSpecialistId(null);
    setShowScheduleManagement(false);
    // workingDays reset removed - handled by SpecialistScheduleManagement
  };

  // Função para lidar com upload de imagem (simples, base64)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setFormData({ ...formData, photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Função para editar um especialista
  const handleEditSpecialist = (specialist: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    photo?: string | null;
    specialty?: string | null;
    bio?: string | null;
    // workingDays parameter removed - handled by SpecialistScheduleManagement
  }) => {
    setFormData({
      id: specialist.id,
      name: specialist.name,
      email: specialist.email || "",
      phone: specialist.phone || "",
      photo: specialist.photo || "",
      specialty: specialist.specialty || "",
      bio: specialist.bio || "",
    });
    // workingDays loading removed - handled by SpecialistScheduleManagement
    setIsEditing(true);
    setEditingSpecialistId(specialist.id);
    setShowScheduleManagement(true);
  };

  // Função para confirmar exclusão
  const confirmDelete = (id: string) => {
    setSpecialistToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Função para excluir especialista
  const handleDeleteSpecialist = () => {
    if (specialistToDelete) {
      deleteMutation.mutate({ id: specialistToDelete });
    }
  };

  // Função para cancelar edição (removida a referência separada, usamos resetForm diretamente)
  // Função para copiar link de agendamento público (link único)
  const handleCopyPublicLink = async () => {
    const publicUrl = `${window.location.origin}/agendar`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLinks(prev => new Set(prev).add("public"));

      // Remover o estado de copiado após 3 segundos
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete("public");
          return newSet;
        });
      }, 3000);
    } catch {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopiedLinks(prev => new Set(prev).add("public"));
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete("public");
          return newSet;
        });
      }, 3000);
    }
  };

  // Função de submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const specialistData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      photo: formData.photo,
      specialty: formData.specialty,
      bio: formData.bio,
      // workingDays will be handled separately by SpecialistScheduleManagement
      status: "active" as const,
    };

    if (isEditing && formData.id) {
      updateMutation.mutate({
        id: formData.id,
        data: specialistData,
      });
    } else {
      // ao criar, enviar especialista e schedule (se habilitado) para operação atômica no servidor
      createMutation.mutate({
        specialist: specialistData,
        schedule: scheduleEnabled ? scheduleDraft : undefined,
      });
    }
  };

  // Copia o horário de um dia (sourceDay) para todos os dias no draft
  const copyScheduleToAll = (sourceDay: number) => {
    const source = scheduleDraft.workingHours.find(
      w => w.dayOfWeek === sourceDay
    );
    if (!source) {
      toast.error("Dia de origem inválido");
      return;
    }

    const newWorking = scheduleDraft.workingHours.map(w => ({
      ...w,
      isWorking: source.isWorking,
      startTime: source.startTime,
      endTime: source.endTime,
      breakStartTime: source.breakStartTime,
      breakEndTime: source.breakEndTime,
    }));

    setScheduleDraft(prev => ({ ...prev, workingHours: newWorking }));
    toast.success("Horários aplicados para todos os dias");
  };

  // Sync functions removed - no longer needed

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Especialistas</h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais do salão
          </p>
        </div>

        {/* Botão de copiar link removido do header superior conforme solicitado pelo usuário */}
      </div>

      {/* Card com link público de agendamento (moved to top) */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Agendamento Público</CardTitle>
            <CardDescription>
              Compartilhe o link para que clientes agendem online.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Link público para reserva (sem necessidade de login)
              </div>
            </div>

            {/* Linha com campo do link + botão copiar */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {/* caixa que imita um input/label grande com truncamento */}
                <div className="w-full rounded-md border px-4 py-3 bg-white/80 dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-gray-100 truncate">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/agendar`
                    : "/agendar"}
                </div>
              </div>

              <Button
                onClick={handleCopyPublicLink}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 text-[var(--primary)] border-[var(--border)] hover:bg-[var(--chart-1)] hover:text-[var(--primary)] font-medium rounded-full shadow-sm"
                aria-label="Copiar link de agendamento público"
              >
                {copiedLinks.has("public") ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Link size={16} />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            </div>

            {/* Botão secundário para visualizar a página de agendamento */}
            <div>
              <a
                href={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/agendar`
                    : "/agendar"
                }
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="ghost"
                  className="w-full border rounded-md py-3"
                >
                  Visualizar página de agendamento
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-10">
          {/* Formulário de cadastro */}
          <Card className="flex-1 shadow-xl border-none rounded-2xl bg-white/90 backdrop-blur-lg">
            <CardHeader className="flex flex-col items-center gap-2 pb-0">
              <div className="flex flex-col items-center gap-2">
                <div className="relative group cursor-pointer">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-100 to-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                      {formData.photo ? (
                        <img
                          src={formData.photo}
                          alt="Foto do especialista"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User2 className="h-16 w-16 text-slate-400" />
                      )}
                      <span className="absolute bottom-2 right-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">
                        Alterar foto
                      </span>
                    </div>
                  </label>
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-600 font-bold mt-2">
                {isEditing ? "Editar Especialista" : "Novo Especialista"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-4 mb-8 ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={nameId}
                      className="text-sm font-medium text-slate-700"
                    >
                      Nome
                    </label>
                    <Input
                      id={nameId}
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={specialtyId}
                      className="text-sm font-medium text-slate-700"
                    >
                      Especialidade
                    </label>
                    <Input
                      id={specialtyId}
                      value={formData.specialty}
                      onChange={e =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      placeholder="Ex: Cabeleireira, Manicure..."
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={phoneId}
                      className="text-sm font-medium text-slate-700"
                    >
                      Telefone
                    </label>
                    <Input
                      id={phoneId}
                      value={formData.phone}
                      onChange={e =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={emailId}
                      className="text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <Input
                      id={emailId}
                      type="email"
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor={bioId}
                    className="text-sm font-medium text-slate-700"
                  >
                    Bio
                  </label>
                  <textarea
                    id={bioId}
                    className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 mt-1"
                    value={formData.bio}
                    onChange={e =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Breve descrição do profissional"
                  />
                </div>

                {/* Gerenciador de horários de trabalho */}
                <div className="col-span-2">
                  {/* Quando criando, permitir configuração inline; ao editar, usar modal existente */}
                  {!isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">
                            Configurar horários agora
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Permite definir horários e preferências antes de
                            salvar
                          </div>
                        </div>
                        <Switch
                          checked={scheduleEnabled}
                          onCheckedChange={setScheduleEnabled}
                        />
                      </div>

                      {scheduleEnabled ? (
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Configurações Gerais</CardTitle>
                              <CardDescription>
                                Defina duração de slots, antecedência e opções
                                de agendamento
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-sm">
                                    Duração do slot (min)
                                  </label>
                                  <Input
                                    type="number"
                                    value={scheduleDraft.timeSlotDuration}
                                    onChange={e =>
                                      setScheduleDraft({
                                        ...scheduleDraft,
                                        timeSlotDuration: parseInt(
                                          e.target.value || "0"
                                        ),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm">
                                    Intervalo entre agendamentos (min)
                                  </label>
                                  <Input
                                    type="number"
                                    value={scheduleDraft.bufferTime}
                                    onChange={e =>
                                      setScheduleDraft({
                                        ...scheduleDraft,
                                        bufferTime: parseInt(
                                          e.target.value || "0"
                                        ),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm">
                                    Dias de antecedência
                                  </label>
                                  <Input
                                    type="number"
                                    value={
                                      scheduleDraft.allowBookingDaysInAdvance
                                    }
                                    onChange={e =>
                                      setScheduleDraft({
                                        ...scheduleDraft,
                                        allowBookingDaysInAdvance: parseInt(
                                          e.target.value || "0"
                                        ),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm">
                                    Antecedência mínima (h)
                                  </label>
                                  <Input
                                    type="number"
                                    value={scheduleDraft.minimumNoticeHours}
                                    onChange={e =>
                                      setScheduleDraft({
                                        ...scheduleDraft,
                                        minimumNoticeHours: parseInt(
                                          e.target.value || "0"
                                        ),
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={scheduleDraft.autoConfirmBookings}
                                    onCheckedChange={val =>
                                      setScheduleDraft({
                                        ...scheduleDraft,
                                        autoConfirmBookings: !!val,
                                      })
                                    }
                                  />
                                  <span className="text-sm">
                                    Confirmação automática
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={scheduleDraft.allowOnlineBooking}
                                    onCheckedChange={val =>
                                      setScheduleDraft({
                                        ...scheduleDraft,
                                        allowOnlineBooking: !!val,
                                      })
                                    }
                                  />
                                  <span className="text-sm">
                                    Agendamento online
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Horários por dia</CardTitle>
                              <CardDescription>
                                Marque os dias em que o especialista trabalha e
                                configure horários
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 gap-2">
                                {/* Ferramenta: copiar horário de um dia para todos */}
                                <div className="flex items-center gap-3 mb-2">
                                  <label className="text-sm font-medium">
                                    Fonte:
                                  </label>
                                  <select
                                    value={copyFromDay}
                                    onChange={e =>
                                      setCopyFromDay(parseInt(e.target.value))
                                    }
                                    className="rounded-md border px-2 py-1 text-sm"
                                  >
                                    {[
                                      "Dom",
                                      "Seg",
                                      "Ter",
                                      "Qua",
                                      "Qui",
                                      "Sex",
                                      "Sáb",
                                    ].map((label, idx) => (
                                      <option key={idx} value={idx}>
                                        {label}
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      copyScheduleToAll(copyFromDay)
                                    }
                                    className="px-3 py-1 text-sm"
                                  >
                                    Aplicar para todos os dias
                                  </Button>
                                </div>
                                {scheduleDraft.workingHours.map(
                                  (
                                    d: {
                                      dayOfWeek: number;
                                      isWorking: boolean;
                                      startTime?: string;
                                      endTime?: string;
                                      breakStartTime?: string;
                                      breakEndTime?: string;
                                    },
                                    idx: number
                                  ) => (
                                    <div
                                      key={d.dayOfWeek}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="w-32 text-sm font-medium">
                                        {
                                          [
                                            "Dom",
                                            "Seg",
                                            "Ter",
                                            "Qua",
                                            "Qui",
                                            "Sex",
                                            "Sáb",
                                          ][d.dayOfWeek]
                                        }
                                      </div>
                                      <Switch
                                        checked={d.isWorking}
                                        onCheckedChange={val => {
                                          const newArr = [
                                            ...scheduleDraft.workingHours,
                                          ];
                                          newArr[idx] = {
                                            ...newArr[idx],
                                            isWorking: !!val,
                                          };
                                          setScheduleDraft({
                                            ...scheduleDraft,
                                            workingHours: newArr,
                                          });
                                        }}
                                      />
                                      <Input
                                        type="time"
                                        value={d.startTime}
                                        onChange={e => {
                                          const newArr = [
                                            ...scheduleDraft.workingHours,
                                          ];
                                          newArr[idx] = {
                                            ...newArr[idx],
                                            startTime: e.target.value,
                                          };
                                          setScheduleDraft({
                                            ...scheduleDraft,
                                            workingHours: newArr,
                                          });
                                        }}
                                        className="w-28"
                                      />
                                      <Input
                                        type="time"
                                        value={d.endTime}
                                        onChange={e => {
                                          const newArr = [
                                            ...scheduleDraft.workingHours,
                                          ];
                                          newArr[idx] = {
                                            ...newArr[idx],
                                            endTime: e.target.value,
                                          };
                                          setScheduleDraft({
                                            ...scheduleDraft,
                                            workingHours: newArr,
                                          });
                                        }}
                                        className="w-28"
                                      />
                                      <Input
                                        type="time"
                                        value={d.breakStartTime}
                                        onChange={e => {
                                          const newArr = [
                                            ...scheduleDraft.workingHours,
                                          ];
                                          newArr[idx] = {
                                            ...newArr[idx],
                                            breakStartTime: e.target.value,
                                          };
                                          setScheduleDraft({
                                            ...scheduleDraft,
                                            workingHours: newArr,
                                          });
                                        }}
                                        className="w-28"
                                      />
                                      <Input
                                        type="time"
                                        value={d.breakEndTime}
                                        onChange={e => {
                                          const newArr = [
                                            ...scheduleDraft.workingHours,
                                          ];
                                          newArr[idx] = {
                                            ...newArr[idx],
                                            breakEndTime: e.target.value,
                                          };
                                          setScheduleDraft({
                                            ...scheduleDraft,
                                            workingHours: newArr,
                                          });
                                        }}
                                        className="w-28"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600">
                            Os horários serão configurados após salvar o
                            especialista
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <SpecialistScheduleManagement
                      isOpen={showScheduleManagement}
                      specialistId={editingSpecialistId || undefined}
                      onClose={() => setShowScheduleManagement(false)}
                    />
                  )}
                </div>

                {/* Botões de ação: Cancelar / Salvar */}
                <div className="flex items-center justify-end gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setScheduleEnabled(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    aria-busy={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="px-4 py-2"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? isEditing
                        ? "Salvando..."
                        : "Criando..."
                      : isEditing
                        ? "Salvar Alterações"
                        : "Criar Especialista"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {/* Listagem dos especialistas */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-6 text-gray-600">
              Especialistas cadastrados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialistsQuery.isLoading && <div>Carregando...</div>}
              {specialistsQuery.data?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">
                  Nenhum especialista cadastrado.
                </div>
              )}
              {specialistsQuery.data?.map(spec => (
                <Card
                  key={spec.id}
                  className="flex items-center gap-6 p-6 shadow rounded-xl border border-muted bg-white"
                >
                  <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                    {spec.photo ? (
                      <AvatarImage
                        src={spec.photo}
                        alt={spec.name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        <User2 className="h-12 w-12 text-muted-foreground " />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-600 mb-1">
                      {spec.name}
                    </div>
                    <div className="text-muted-foreground text-sm mb-1">
                      {spec.specialty}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {spec.email}
                    </div>
                    <div className="text-muted-foreground text-sm mb-2">
                      {spec.phone}
                    </div>
                    {spec.bio && (
                      <div className="text-xs text-muted-foreground italic mt-2">
                        {spec.bio}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex flex-row gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-3 py-2 text-[var(--primary)] border-[var(--border)] hover:bg-[var(--chart-1)] hover:text-[var(--primary)] font-medium rounded-lg shadow-sm text-xs"
                        onClick={() =>
                          handleEditSpecialist({
                            id: spec.id,
                            name: spec.name,
                            email: spec.email,
                            phone: spec.phone,
                            photo: spec.photo,
                            specialty: spec.specialty,
                            bio: spec.bio,
                            // workingDays removed - handled separately
                          })
                        }
                      >
                        <Edit size={16} />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-3 py-2 text-[var(--primary)] border-[var(--border)] hover:bg-[var(--chart-1)] hover:text-[var(--primary)] font-medium rounded-lg shadow-sm text-xs"
                        onClick={() => confirmDelete(spec.id)}
                      >
                        <Trash2 size={16} />
                        Excluir
                      </Button>{" "}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação para excluir */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este especialista? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpecialist}
              className="bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
