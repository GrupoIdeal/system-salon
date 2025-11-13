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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CalendarPicker } from "./CalendarPicker";
import { TimeSlotPicker } from "./TimeSlotPicker";

interface AppointmentData {
  id: string;
  clientId: string;
  serviceId: string;
  specialistId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: AppointmentData;
  initialDate?: Date;
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  initialDate,
}: AppointmentModalProps) {
  const [step, setStep] = useState(1); // 1: Data, 2: Cliente/Serviço, 3: Horário, 4: Confirmação
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    specialistId: "",
    appointmentDate: initialDate || new Date(),
    appointmentTime: "",
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        // Modo edição
        setFormData({
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          specialistId: appointment.specialistId,
          appointmentDate: new Date(appointment.appointmentDate),
          appointmentTime: appointment.appointmentTime,
          status: appointment.status,
          notes: appointment.notes || "",
        });
        setStep(4); // Ir direto para confirmação na edição
      } else {
        // Modo criação
        setFormData({
          clientId: "",
          serviceId: "",
          specialistId: "",
          appointmentDate: initialDate || new Date(),
          appointmentTime: "",
          status: "pending",
          notes: "",
        });
        setStep(1);
      }
      setErrors({});
    }
  }, [isOpen, appointment, initialDate]);

  // Queries
  const clientsQuery = trpc.clients.list.useQuery({});
  const servicesQuery = trpc.services.list.useQuery();
  const specialistsQuery = trpc.specialists.list.useQuery();

  // Mutations
  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: error => {
      setErrors({ submit: error.message });
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: error => {
      setErrors({ submit: error.message });
    },
  });

  const deleteMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  // Filtrar especialistas por serviço selecionado
  const availableSpecialists =
    specialistsQuery.data?.filter(specialist => {
      if (!formData.serviceId) return true;
      const service = servicesQuery.data?.find(
        s => s.id === formData.serviceId
      );
      return !service?.specialistId || service.specialistId === specialist.id;
    }) || [];

  const selectedClient = clientsQuery.data?.find(
    c => c.id === formData.clientId
  );
  const selectedService = servicesQuery.data?.find(
    s => s.id === formData.serviceId
  );
  const selectedSpecialist = specialistsQuery.data?.find(
    s => s.id === formData.specialistId
  );

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.appointmentDate) {
          newErrors.appointmentDate = "Selecione uma data";
        }
        break;
      case 2:
        if (!formData.clientId) newErrors.clientId = "Selecione um cliente";
        if (!formData.serviceId) newErrors.serviceId = "Selecione um serviço";
        if (!formData.specialistId)
          newErrors.specialistId = "Selecione um especialista";
        break;
      case 3:
        if (!formData.appointmentTime) {
          newErrors.appointmentTime = "Selecione um horário";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(4)) return;

    const appointmentData = {
      ...formData,
      appointmentDate: formData.appointmentDate,
    };

    if (appointment) {
      updateMutation.mutate({
        id: appointment.id,
        data: appointmentData,
      });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const handleDelete = () => {
    if (
      appointment &&
      confirm("Tem certeza que deseja excluir este agendamento?")
    ) {
      deleteMutation.mutate({ id: appointment.id });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Selecionar Data</h3>
            </div>
            <CalendarPicker
              selectedDate={formData.appointmentDate}
              onDateSelect={date =>
                setFormData({ ...formData, appointmentDate: date })
              }
            />
            {errors.appointmentDate && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.appointmentDate}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Cliente e Serviço</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={value =>
                    setFormData({ ...formData, clientId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsQuery.data?.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span>{client.name}</span>
                          {client.phone && (
                            <span className="text-xs text-muted-foreground">
                              {client.phone}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.clientId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="service">Serviço *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={value => {
                    const service = servicesQuery.data?.find(
                      s => s.id === value
                    );
                    setFormData({
                      ...formData,
                      serviceId: value,
                      // Auto-selecionar especialista se serviço tem especialista específico
                      specialistId:
                        service?.specialistId || formData.specialistId,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesQuery.data?.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>⏱️ {formatDuration(service.duration)}</span>
                            <span>💰 R$ {service.price}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.serviceId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="specialist">Especialista *</Label>
                <Select
                  value={formData.specialistId}
                  onValueChange={value =>
                    setFormData({ ...formData, specialistId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecialists.map(specialist => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        <div className="flex flex-col">
                          <span>{specialist.name}</span>
                          {specialist.specialty && (
                            <span className="text-xs text-muted-foreground">
                              {specialist.specialty}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialistId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.specialistId}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Selecionar Horário</h3>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Data:</span>
                <span>
                  {formData.appointmentDate.toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Serviço:</span>
                <span>
                  {selectedService?.name} (
                  {formatDuration(selectedService?.duration)})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Especialista:</span>
                <span>{selectedSpecialist?.name}</span>
              </div>
            </div>

            <TimeSlotPicker
              specialistId={formData.specialistId}
              serviceId={formData.serviceId}
              date={formData.appointmentDate}
              selectedTime={formData.appointmentTime}
              onTimeSelect={time =>
                setFormData({ ...formData, appointmentTime: time })
              }
            />

            {errors.appointmentTime && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.appointmentTime}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {appointment ? "Editar Agendamento" : "Confirmar Agendamento"}
              </h3>
            </div>

            {/* Resumo do agendamento */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    CLIENTE
                  </Label>
                  <p className="font-medium">{selectedClient?.name}</p>
                  {selectedClient?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {selectedClient.phone}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    SERVIÇO
                  </Label>
                  <p className="font-medium">{selectedService?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(selectedService?.duration)} •{" "}
                    {formatServicePrice(
                      selectedService?.price,
                      Boolean(selectedService?.priceFrom)
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    DATA
                  </Label>
                  <p className="font-medium">
                    {formData.appointmentDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    HORÁRIO
                  </Label>
                  <p className="font-medium">{formData.appointmentTime}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  ESPECIALISTA
                </Label>
                <p className="font-medium">{selectedSpecialist?.name}</p>
                {selectedSpecialist?.specialty && (
                  <p className="text-sm text-muted-foreground">
                    {selectedSpecialist.specialty}
                  </p>
                )}
              </div>
            </div>

            {/* Status do agendamento (apenas na edição) */}
            {appointment && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "pending" | "confirmed" | "completed" | "cancelled"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <Badge
                        variant="outline"
                        className="bg-[var(--chart-1)] text-[var(--primary)]"
                      >
                        Pendente
                      </Badge>
                    </SelectItem>
                    <SelectItem value="confirmed">
                      <Badge
                        variant="outline"
                        className="bg-[var(--chart-1)] text-[var(--primary)]"
                      >
                        Confirmado
                      </Badge>
                    </SelectItem>
                    <SelectItem value="completed">
                      <Badge
                        variant="outline"
                        className="bg-[var(--chart-2)] text-[var(--primary)]"
                      >
                        Concluído
                      </Badge>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <Badge
                        variant="outline"
                        className="bg-[var(--destructive)] text-[var(--destructive-foreground)]"
                      >
                        Cancelado
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observações */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais sobre o agendamento..."
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {step < 4 ? `Etapa ${step} de 3` : "Revise e confirme os dados"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        {!appointment && (
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4].map(stepNumber => (
              <div key={stepNumber} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      stepNumber < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="min-h-[400px]">{renderStep()}</div>

        <DialogFooter className="gap-2">
          {appointment && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Excluir
            </Button>
          )}

          {step > 1 && !appointment && (
            <Button variant="outline" onClick={prevStep} disabled={isLoading}>
              Voltar
            </Button>
          )}

          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancelar
          </Button>

          {step < 4 && !appointment ? (
            <Button onClick={nextStep} disabled={isLoading}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {appointment ? "Salvar Alterações" : "Criar Agendamento"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
