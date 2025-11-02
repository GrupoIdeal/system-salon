// Página pública de agendamento para clientes

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { publicTrpc, publicTrpcClient } from "@/lib/public-trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Instagram,
  MessageSquare,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Interfaces para tipos
interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string;
}

interface SpecialistData {
  id: string;
  name: string;
  specialty: string | null;
  photo: string | null;
  bio: string | null;
  workingDays: Record<
    string,
    Array<{
      start: string;
      end: string;
      lunch?: { start: string; end: string };
    }>
  > | null;
}

// Componente principal da página
function PublicBookingPage() {
  const [step, setStep] = useState<
    "specialist" | "service" | "datetime" | "client" | "confirmation"
  >("specialist");
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    message: string;
    appointmentId?: string;
  } | null>(null); // Queries tRPC públicas
  const salonQuery = publicTrpc.booking.getSalonInfo.useQuery();
  const salon = salonQuery.data;
  const instagram = (salon as unknown as { instagram?: string } | undefined)?.instagram;

  const specialistsQuery = publicTrpc.booking.getAllSpecialists.useQuery();

  // Debug: logar status/dados/erros da query para investigar problema de não mostrar especialistas
  useEffect(() => {
    console.log("[PublicBooking] specialistsQuery status:", {
      status: specialistsQuery.status,
      isLoading: specialistsQuery.isLoading,
      isError: specialistsQuery.isError,
      data: specialistsQuery.data,
      error: specialistsQuery.error,
    });
  }, [
    specialistsQuery.status,
    specialistsQuery.isLoading,
    specialistsQuery.isError,
    specialistsQuery.data,
    specialistsQuery.error,
  ]);

  const servicesQuery = publicTrpc.booking.getSpecialistServices.useQuery(
    { specialistId: selectedSpecialist },
    { enabled: !!selectedSpecialist }
  );

  const timeSlotsQuery = publicTrpc.booking.getAvailableTimeSlots.useQuery(
    {
      specialistId: selectedSpecialist,
      serviceId: selectedService,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    },
    {
      enabled: !!selectedSpecialist && !!selectedService && !!selectedDate,
    }
  );

  const createAppointmentMutation =
    publicTrpc.booking.createPublicAppointment.useMutation({
      onSuccess: result => {
        setBookingResult(result);
        setStep("confirmation");
        setIsSubmitting(false);
      },
      onError: error => {
        alert("Erro ao criar agendamento: " + error.message);
        setIsSubmitting(false);
      },
    });

  if (salonQuery.isLoading || specialistsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Carregando informações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    salonQuery.isError ||
    !salonQuery.data ||
    specialistsQuery.isError ||
    !specialistsQuery.data
  ) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-[var(--destructive)] mb-2">
              Serviço Indisponível
            </h2>
            <p className="text-gray-600">
              O sistema de agendamento não está disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const specialists = Array.isArray(specialistsQuery.data)
    ? specialistsQuery.data
    : [];
  const services = Array.isArray(servicesQuery.data) ? servicesQuery.data : [];
  const timeSlots = Array.isArray(timeSlotsQuery.data)
    ? timeSlotsQuery.data
    : [];

  const selectedSpecialistData = specialists.find(
    (s: SpecialistData) => s.id === selectedSpecialist
  );

  // Gerar próximos 30 dias para seleção
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return date;
  });

  const handleSpecialistSelect = (specialistId: string) => {
    setSelectedSpecialist(specialistId);
    setSelectedService("");
    setSelectedDate(null);
    setSelectedTime("");
    setStep("service");
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate(null);
    setSelectedTime("");
    setStep("datetime");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("client");
  };

  const handleSubmit = () => {
    if (
      !selectedService ||
      !selectedDate ||
      !selectedTime ||
      !clientData.name ||
      !clientData.phone
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    createAppointmentMutation.mutate({
      specialistId: selectedSpecialist,
      serviceId: selectedService,
      clientName: clientData.name,
      clientPhone: clientData.phone,
      clientEmail: clientData.email || undefined,
      appointmentDate: format(selectedDate, "yyyy-MM-dd"),
      appointmentTime: selectedTime,
      notes: clientData.notes || undefined,
    });
  };

  const selectedServiceData = services.find(
    (s: ServiceData) => s.id === selectedService
  );

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header com título à esquerda e card escuro do salão à direita */}
        <div className="mb-6 w-full flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Agendar Horário
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Escolha um serviço, data e horário disponíveis para atendimento.
            </p>
          </div>

          <div className="w-full lg:w-96">
            <Card className="rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xl overflow-hidden">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-semibold text-white">
                  {salon?.name}
                </CardTitle>
                {salon?.address && (
                  <div className="text-xs text-[var(--primary-foreground)] mt-1 truncate">
                    {salon.address}
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1">
                  {salon?.phone && (
                    <div className="text-sm text-white flex items-center gap-2">
                      <Phone className="h-4 w-4 text-white" />{" "}
                      <span className="text-sm">{salon.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Instagram (com tooltip) */}
                  {instagram ? (
                    <span className="relative group">
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram do salão"
                        title="Abrir Instagram"
                        className="p-2 rounded-md bg-[var(--sidebar-primary)] hover:bg-[var(--primary)] inline-flex"
                      >
                        <Instagram className="h-5 w-5 text-white" />
                      </a>
                      <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Abrir Instagram
                      </span>
                    </span>
                  ) : null}

                  {/* WhatsApp (com tooltip) */}
                  {salon?.phone ? (
                    <span className="relative group">
                      <a
                        href={`https://wa.me/${(salon.phone || "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp do salão"
                        title="Abrir WhatsApp"
                        className="p-2 rounded-md bg-[var(--sidebar-primary)] hover:bg-[var(--primary)] inline-flex"
                      >
                        <MessageSquare className="h-5 w-5 text-white" />
                      </a>
                      <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Abrir WhatsApp
                      </span>
                    </span>
                  ) : null}

                  {/* Mapa (com tooltip) */}
                  {salon?.address ? (
                    <span className="relative group">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir endereço no mapa"
                        title="Abrir no Maps"
                        className="p-2 rounded-md bg-[var(--sidebar-primary)] hover:bg-[var(--primary)] inline-flex"
                      >
                        <MapPin className="h-5 w-5 text-white" />
                      </a>
                      <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Abrir no Maps
                      </span>
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stepper visual */}
        <div className="mb-6 px-2 sm:px-0">
          <div className="flex items-center justify-between text-sm">
            {[
              "Especialista",
              "Serviço",
              "Data/Hora",
              "Seus Dados",
              "Confirmação",
            ].map((stepName, index) => {
              const stepKeys = [
                "specialist",
                "service",
                "datetime",
                "client",
                "confirmation",
              ];
              const currentStepIndex = stepKeys.indexOf(step);
              const isActive = index <= currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isCompleted
                      ? "bg-[var(--primary)]"
                      : isActive
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`ml-2 ${isActive ? "text-[var(--primary)] font-medium" : "text-gray-500"}`}
                  >
                    {stepName}
                  </span>
                  {index < 3 && (
                    <div
                      className={`w-12 h-px mx-4 ${index < currentStepIndex
                        ? "bg-[var(--primary)]"
                        : "bg-gray-200"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conteúdo por step */}
        {step === "specialist" && (
          <Card className="shadow-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Escolha um Especialista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {specialistsQuery.isLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando especialistas...</p>
                  </div>
                )}

                {!specialistsQuery.isLoading && specialists.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Nenhum especialista disponível no momento.
                    </p>
                  </div>
                )}

                {specialists.map((specialist: SpecialistData) => (
                  <button
                    key={specialist.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--background)] transition-colors text-left w-full"
                    onClick={() => handleSpecialistSelect(specialist.id)}
                  >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage
                          className="h-16 w-16 object-cover rounded-full"
                          src={specialist.photo || undefined}
                          alt={specialist.name}
                        />
                        <AvatarFallback className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded-full">
                          <User className="h-8 w-8 text-gray-500" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {specialist.name}
                        </h3>
                        {specialist.specialty && (
                          <p className="text-[var(--primary)] font-medium">
                            {specialist.specialty}
                          </p>
                        )}
                        {specialist.bio && (
                          <p className="text-gray-600 text-sm mt-1">
                            {specialist.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === "service" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Escolha um Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {services.map((service: ServiceData) => (
                  <div
                    key={service.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--background)] transition-colors"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--primary)]">
                          R$ {Number(service.price).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("specialist")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Especialistas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "datetime" && selectedServiceData && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Escolha Data e Horário
              </CardTitle>
              <div className="text-sm text-gray-600">
                Serviço:{" "}
                <span className="font-medium">{selectedServiceData.name}</span>•
                R$ {Number(selectedServiceData.price).toFixed(2)}•{" "}
                {selectedServiceData.duration} min
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Seleção de data */}
                <div>
                  <h4 className="font-medium mb-3">Selecione uma data:</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {availableDates.map(date => {
                      const isSelected =
                        selectedDate && isSameDay(date, selectedDate);

                      return (
                        <button
                          key={date.toISOString()}
                          className={`p-2 text-sm rounded-lg border transition-colors ${isSelected
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-white hover:bg-[var(--background)] border-gray-200"
                            }`}
                          onClick={() => handleDateSelect(date)}
                        >
                          <div className="text-xs text-gray-500">
                            {format(date, "EEE", { locale: ptBR })}
                          </div>
                          <div className="font-medium">{format(date, "d")}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seleção de horário */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Horários disponíveis para{" "}
                      {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}:
                    </h4>

                    {timeSlotsQuery.isLoading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)] mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          Carregando horários...
                        </p>
                      </div>
                    )}

                    {!timeSlotsQuery.isLoading && timeSlots.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        Nenhum horário disponível para esta data.
                      </p>
                    )}

                    <div className="grid grid-cols-4 gap-3">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          className={`p-3 text-sm rounded-lg border transition-colors ${selectedTime === time
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                            : "bg-white hover:bg-[var(--background)] border-gray-200"
                            }`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("service")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "client" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="client-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome Completo *
                  </label>
                  <Input
                    id="client-name"
                    value={clientData.name}
                    onChange={e =>
                      setClientData({ ...clientData, name: e.target.value })
                    }
                    placeholder="Digite seu nome completo"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="client-phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefone *
                  </label>
                  <Input
                    id="client-phone"
                    value={clientData.phone}
                    onChange={e =>
                      setClientData({ ...clientData, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="client-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email (opcional)
                  </label>
                  <Input
                    id="client-email"
                    type="email"
                    value={clientData.email}
                    onChange={e =>
                      setClientData({ ...clientData, email: e.target.value })
                    }
                    placeholder="seu@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="client-notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Observações (opcional)
                  </label>
                  <textarea
                    id="client-notes"
                    value={clientData.notes}
                    onChange={e =>
                      setClientData({ ...clientData, notes: e.target.value })
                    }
                    placeholder="Alguma observação especial sobre o atendimento..."
                    className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("datetime")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting || !clientData.name || !clientData.phone
                    }
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--chart-4)]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Agendando...
                      </>
                    ) : (
                      "Confirmar Agendamento"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "confirmation" && bookingResult && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-8">
              {bookingResult.success ? (
                <>
                  <div className="w-16 h-16 bg-[var(--chart-1)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Agendamento Criado!
                  </h2>
                  <p className="text-gray-600 mb-6">{bookingResult.message}</p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Resumo do Agendamento:
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <strong>Especialista:</strong>{" "}
                        {selectedSpecialistData?.name}
                      </div>
                      <div>
                        <strong>Serviço:</strong> {selectedServiceData?.name}
                      </div>
                      <div>
                        <strong>Data:</strong>{" "}
                        {selectedDate &&
                          format(selectedDate, "d 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                      </div>
                      <div>
                        <strong>Horário:</strong> {selectedTime}
                      </div>
                      <div>
                        <strong>Cliente:</strong> {clientData.name}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {clientData.phone}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--background)] rounded-lg p-4 mb-6">
                    <p className="text-sm text-[#c04560]">
                      <strong>Atenção:</strong> Embora o seu agendamento esteja
                      confirmado, ocasionalmente o atendimento pode atrasar
                      devido a atendimentos anteriores ou imprevistos. Por
                      favor, planeje uma margem de tempo ao se deslocar até o
                      salão. Agradecemos a compreensão — faremos o possível para
                      minimizar atrasos.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[var(--destructive)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-[var(--destructive)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Erro no Agendamento
                  </h2>
                  <p className="text-gray-600 mb-6">{bookingResult.message}</p>
                </>
              )}

              <Button
                onClick={() => {
                  // Redirecionar para a página pública de agendamento
                  window.location.href = "/agendar";
                }}
                className="bg-[var(--primary)] hover:bg-[var(--chart-4)]"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Wrapper com QueryClientProvider
export default function PublicBooking() {
  return (
    <publicTrpc.Provider client={publicTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <PublicBookingPage />
      </QueryClientProvider>
    </publicTrpc.Provider>
  );
}
