// Estados removidos pois não estão sendo usados atualmente
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

interface TimeSlotPickerProps {
  specialistId: string;
  serviceId: string;
  date: Date;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
}

export function TimeSlotPicker({
  specialistId,
  serviceId,
  date,
  selectedTime,
  onTimeSelect,
  disabled = false,
}: TimeSlotPickerProps) {
  // Busca horários disponíveis
  const availableSlotsQuery = trpc.appointments.getAvailableSlots.useQuery(
    {
      specialistId,
      serviceId,
      date,
    },
    {
      enabled: !!(specialistId && serviceId && date),
      refetchOnWindowFocus: false,
    }
  );

  // Valida horário selecionado
  const validateSlotQuery = trpc.appointments.validateSlot.useQuery(
    {
      specialistId,
      serviceId,
      date,
      time: selectedTime || "",
    },
    {
      enabled: !!(selectedTime && specialistId && serviceId && date),
      refetchOnWindowFocus: false,
    }
  );

  // Busca sugestões se horário não está disponível
  const suggestionsQuery = trpc.appointments.getSuggestions.useQuery(
    {
      specialistId,
      serviceId,
      date,
      preferredTime: selectedTime || "09:00",
      maxSuggestions: 5,
    },
    {
      enabled: !!(
        selectedTime &&
        specialistId &&
        serviceId &&
        date &&
        validateSlotQuery.data &&
        !validateSlotQuery.data.valid
      ),
      refetchOnWindowFocus: false,
    }
  );

  const formatTimeSlot = (time: string) => {
    if (!time || typeof time !== "string") {
      return "00:00";
    }

    const parts = time.split(":");
    if (parts.length !== 2) {
      return "00:00";
    }

    const [hours, minutes] = parts;
    return `${hours}:${minutes}`;
  };

  const groupSlotsByPeriod = (slots: string[]) => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    slots.forEach(slot => {
      if (!slot || typeof slot !== "string") {
        return;
      }

      const parts = slot.split(":");
      if (parts.length !== 2) {
        return;
      }

      const hour = parseInt(parts[0]);
      if (Number.isNaN(hour)) {
        return;
      }

      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  if (!specialistId || !serviceId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>
          Selecione um especialista e serviço para ver os horários disponíveis
        </p>
      </div>
    );
  }

  if (availableSlotsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton
              key={`skeleton-loading-${Date.now()}-${i}`}
              className="h-10 w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (availableSlotsQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar horários disponíveis. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  // Filtra e valida os slots recebidos do backend
  const rawSlots = availableSlotsQuery.data || [];
  const slots = rawSlots.filter(slot => {
    if (!slot || typeof slot !== "string") {
      return false;
    }

    const parts = slot.split(":");
    if (parts.length !== 2) {
      return false;
    }

    const [hours, minutes] = parts.map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return false;
    }

    return true;
  });

  if (slots.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="font-medium">Nenhum horário disponível</p>
        <p className="text-sm">
          O especialista não tem horários configurados ou não trabalha nesta
          data.
        </p>
        <p className="text-xs mt-2 text-[var(--primary)]">
          💡 Configure os horários do especialista na seção "Especialistas"
        </p>
      </div>
    );
  }

  const { morning, afternoon, evening } = groupSlotsByPeriod(slots);

  const renderSlotSection = (
    title: string,
    sectionSlots: string[],
    icon: React.ReactNode
  ) => {
    if (sectionSlots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sectionSlots.map(slot => {
            const isSelected = selectedTime === slot;
            const isValidating =
              selectedTime === slot && validateSlotQuery.isLoading;

            return (
              <Button
                key={slot}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`relative ${isSelected ? "bg-primary" : ""}`}
                onClick={() => !disabled && onTimeSelect(slot)}
                disabled={disabled || isValidating}
              >
                {isValidating ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">{formatTimeSlot(slot)}</span>
                  </div>
                ) : (
                  formatTimeSlot(slot)
                )}
                {isSelected && validateSlotQuery.data?.valid && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-[var(--primary)] bg-white rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Validação do horário selecionado */}
      {selectedTime &&
        validateSlotQuery.data &&
        !validateSlotQuery.data.valid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Horário não disponível:</strong>{" "}
              {validateSlotQuery.data.reason}
            </AlertDescription>
          </Alert>
        )}

      {/* Sugestões de horários alternativos */}
      {selectedTime &&
        suggestionsQuery.data &&
        suggestionsQuery.data.length > 0 && (
          <Card className="bg-[var(--chart-1)] border-[var(--border)]">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Horários disponíveis próximos
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestionsQuery.data.map(suggestion => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-[var(--chart-2)] bg-[var(--chart-1)] text-[var(--primary)] border-[var(--border)]"
                    onClick={() => onTimeSelect(suggestion)}
                  >
                    {formatTimeSlot(suggestion)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Slots de horários por período */}
      <div className="space-y-6">
        {renderSlotSection(
          "Manhã",
          morning,
          <span className="text-[var(--chart-2)]">☀️</span>
        )}

        {renderSlotSection(
          "Tarde",
          afternoon,
          <span className="text-[var(--primary)]">☀️</span>
        )}

        {renderSlotSection(
          "Noite",
          evening,
          <span className="text-[var(--primary)]">🌙</span>
        )}
      </div>

      {/* Status do horário selecionado */}
      {selectedTime && validateSlotQuery.data?.valid && (
        <div className="flex items-center gap-2 p-3 bg-[var(--chart-1)] border border-[var(--border)] rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            Horário {formatTimeSlot(selectedTime)} confirmado e disponível
          </span>
        </div>
      )}
    </div>
  );
}
