import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  useTheme,
  Card,
  RadioButton,
  ProgressBar,
  Surface,
  IconButton,
} from "react-native-paper";
import { API_URL } from "../lib/constants";
import TextInput from "../components/ui/TextInput";

type Step = 1 | 2 | 3 | 4 | 5;

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: string;
}

interface Specialist {
  id: string;
  name: string;
  specialty?: string;
  photo?: string;
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

export default function AgendamentoPublicoScreen() {
  const theme = useTheme();
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [servicesRes, specialistsRes] = await Promise.all([
        fetch(`${API_URL}/api/public/booking.getSalonInfo`),
        fetch(`${API_URL}/api/public/booking.getAllSpecialists`),
      ]);
      if (servicesRes.ok) {
        const salonData = await servicesRes.json();
        if (salonData.result?.data?.services) {
          setServices(salonData.result.data.services);
        }
      }
      if (specialistsRes.ok) {
        const specData = await specialistsRes.json();
        if (specData.result?.data) {
          setSpecialists(specData.result.data);
        }
      }
      const trpcServices = await fetch(`${API_URL}/api/trpc/services.list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (trpcServices.ok) {
        const svcData = await trpcServices.json();
        if (svcData.result?.data) {
          setServices(svcData.result.data);
        }
      }
    } catch {
      setServices([
        { id: "1", name: "Corte de Cabelo", duration: 30, price: "49.90" },
        { id: "2", name: "Barba", duration: 20, price: "29.90" },
        { id: "3", name: "Corte + Barba", duration: 45, price: "69.90" },
        { id: "4", name: "Hidratação", duration: 40, price: "59.90" },
      ]);
      setSpecialists([
        { id: "1", name: "Carlos Silva", specialty: "Cabelereiro" },
        { id: "2", name: "Ana Oliveira", specialty: "Barbeira" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialistsForService = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/booking.getAllSpecialists`);
      if (res.ok) {
        const data = await res.json();
        if (data.result?.data) {
          setSpecialists(data.result.data);
          return;
        }
      }
    } catch {
    }
    setSpecialists([
      { id: "1", name: "Carlos Silva", specialty: "Cabelereiro" },
      { id: "2", name: "Ana Oliveira", specialty: "Barbeira" },
    ]);
  }, []);

  const loadTimeSlots = useCallback(async () => {
    if (!selectedSpecialist || !selectedService || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/public/booking.getAvailableTimeSlots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistId: selectedSpecialist.id,
          serviceId: selectedService.id,
          date: selectedDate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result?.data) {
          setSlots(data.result.data);
          return;
        }
      }
    } catch {
    }
    setSlots(["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]);
    setLoading(false);
  }, [selectedSpecialist, selectedService, selectedDate]);

  useEffect(() => {
    if (step === 2 && specialists.length === 0) {
      loadSpecialistsForService();
    }
  }, [step, loadSpecialistsForService, specialists.length]);

  useEffect(() => {
    if (step === 4 && selectedDate && selectedSpecialist && selectedService) {
      loadTimeSlots();
    }
  }, [step, selectedDate, selectedSpecialist, selectedService, loadTimeSlots]);

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!selectedService;
      case 2:
        return !!selectedSpecialist;
      case 3:
        return !!selectedDate;
      case 4:
        return !!selectedTime;
      case 5:
        return !!(clientInfo.name.trim() && clientInfo.email.trim() && clientInfo.phone.trim());
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!canProceed()) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5) as Step);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/booking.createPublicAppointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistId: selectedSpecialist!.id,
          serviceId: selectedService!.id,
          clientName: clientInfo.name.trim(),
          clientPhone: clientInfo.phone.trim(),
          clientEmail: clientInfo.email.trim(),
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
        }),
      });
      const data = await res.json();
      if (data.result?.data) {
        setAppointmentId(data.result.data.appointmentId ?? null);
        setSuccess(true);
      } else {
        throw new Error(data.error?.message ?? "Erro ao criar agendamento");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar agendamento";
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Serviço", "Profissional", "Data", "Horário", "Confirmação"];

  if (success) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="check-circle" size={80} iconColor="#4CAF50" />
        <Text variant="headlineSmall" style={styles.successTitle}>
          Agendamento Confirmado!
        </Text>
        <Text style={styles.successText}>
          Seu agendamento foi criado com sucesso.
        </Text>
        {appointmentId && (
          <Text style={styles.appointmentId}>Código: {appointmentId}</Text>
        )}
        <Text style={styles.successDetail}>
          {selectedService?.name} com {selectedSpecialist?.name}
        </Text>
        <Text style={styles.successDetail}>
          {selectedDate} às {selectedTime}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            setStep(1);
            setSuccess(false);
            setSelectedService(null);
            setSelectedSpecialist(null);
            setSelectedDate("");
            setSelectedTime("");
            setClientInfo({ name: "", email: "", phone: "" });
          }}
          style={styles.newBookingButton}
        >
          Novo Agendamento
        </Button>
      </View>
    );
  }

  if (loading && step === 1 && services.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Agendamento Online
      </Text>

      <View style={styles.stepsIndicator}>
        {stepLabels.map((label, idx) => (
          <View key={label} style={styles.stepDotContainer}>
            <Surface
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    idx + 1 <= step ? theme.colors.primary : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text style={styles.stepDotText}>{idx + 1}</Text>
            </Surface>
            <Text
              style={[
                styles.stepLabel,
                { color: idx + 1 <= step ? theme.colors.primary : "#999" },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ProgressBar
        progress={step / 5}
        color={theme.colors.primary}
        style={styles.progressBar}
      />

      {step === 1 && (
        <View>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Selecione o Serviço
          </Text>
          {services.map((svc) => (
            <Card
              key={svc.id}
              style={[
                styles.selectCard,
                selectedService?.id === svc.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedService(svc)}
            >
              <Card.Content style={styles.selectCardContent}>
                <RadioButton
                  value={svc.id}
                  status={selectedService?.id === svc.id ? "checked" : "unchecked"}
                />
                <View style={styles.selectCardInfo}>
                  <Text style={styles.selectCardTitle}>{svc.name}</Text>
                  <Text style={styles.selectCardSub}>
                    {svc.duration}min · R$ {svc.price}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {step === 2 && (
        <View>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Selecione o Profissional
          </Text>
          {specialists.map((spec) => (
            <Card
              key={spec.id}
              style={[
                styles.selectCard,
                selectedSpecialist?.id === spec.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedSpecialist(spec)}
            >
              <Card.Content style={styles.selectCardContent}>
                <RadioButton
                  value={spec.id}
                  status={selectedSpecialist?.id === spec.id ? "checked" : "unchecked"}
                />
                <View style={styles.selectCardInfo}>
                  <Text style={styles.selectCardTitle}>{spec.name}</Text>
                  {spec.specialty && (
                    <Text style={styles.selectCardSub}>{spec.specialty}</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {step === 3 && (
        <View>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Selecione a Data
          </Text>
          <TextInput
            label="Data (AAAA-MM-DD)"
            value={selectedDate}
            onChangeText={setSelectedDate}
            helperText="Ex: 2026-06-15"
          />
        </View>
      )}

      {step === 4 && (
        <View>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Selecione o Horário
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : slots.length === 0 ? (
            <Text>Nenhum horário disponível para esta data</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((time) => (
                <Surface
                  key={time}
                  style={[
                    styles.slotItem,
                    {
                      backgroundColor:
                        selectedTime === time
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Button
                    mode="text"
                    compact
                    textColor={selectedTime === time ? "#fff" : undefined}
                    onPress={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                </Surface>
              ))}
            </View>
          )}
        </View>
      )}

      {step === 5 && (
        <View>
          <Text variant="titleMedium" style={styles.stepTitle}>
            Seus Dados
          </Text>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLine}>
                Serviço: {selectedService?.name}
              </Text>
              <Text style={styles.summaryLine}>
                Profissional: {selectedSpecialist?.name}
              </Text>
              <Text style={styles.summaryLine}>Data: {selectedDate}</Text>
              <Text style={styles.summaryLine}>Horário: {selectedTime}</Text>
            </Card.Content>
          </Card>

          <TextInput
            label="Nome completo"
            value={clientInfo.name}
            onChangeText={(v) => setClientInfo((p) => ({ ...p, name: v }))}
          />
          <TextInput
            label="E-mail"
            value={clientInfo.email}
            onChangeText={(v) => setClientInfo((p) => ({ ...p, email: v }))}
            keyboardType="email-address"
          />
          <TextInput
            label="Telefone"
            value={clientInfo.phone}
            onChangeText={(v) => setClientInfo((p) => ({ ...p, phone: v }))}
            keyboardType="phone-pad"
          />
        </View>
      )}

      <View style={styles.navigation}>
        {step > 1 && (
          <Button mode="outlined" onPress={prevStep} style={styles.navButton}>
            Anterior
          </Button>
        )}
        <View style={styles.navSpacer} />
        {step < 5 ? (
          <Button
            mode="contained"
            onPress={nextStep}
            disabled={!canProceed()}
            style={styles.navButton}
          >
            Próximo
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || !canProceed()}
            style={styles.navButton}
          >
            Confirmar Agendamento
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  stepsIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepDotContainer: {
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 24,
  },
  stepTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  selectCard: {
    marginBottom: 8,
    borderColor: "transparent",
    borderWidth: 2,
  },
  selectCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  selectCardTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  selectCardSub: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotItem: {
    borderRadius: 8,
    overflow: "hidden",
    minWidth: "22%",
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryLine: {
    fontSize: 14,
    marginBottom: 4,
  },
  navigation: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  navSpacer: {
    flex: 1,
  },
  successTitle: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  appointmentId: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    color: "#666",
  },
  successDetail: {
    fontSize: 15,
    marginBottom: 4,
  },
  newBookingButton: {
    marginTop: 24,
  },
});
