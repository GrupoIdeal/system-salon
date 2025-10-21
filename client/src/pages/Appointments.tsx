import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Appointments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    specialistId: "",
    appointmentDate: new Date(),
    appointmentTime: "09:00",
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
  });

  const appointmentsQuery = trpc.appointments.list.useQuery({
    startDate: new Date(selectedDate),
    endDate: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000),
  });

  const clientsQuery = trpc.clients.list.useQuery({});
  const servicesQuery = trpc.services.list.useQuery();
  const specialistsQuery = trpc.specialists.list.useQuery();

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      appointmentsQuery.refetch();
      setFormData({
        clientId: "",
        serviceId: "",
        specialistId: "",
        appointmentDate: new Date(),
        appointmentTime: "09:00",
        status: "pending",
      });
      setIsDialogOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceId || !formData.specialistId) {
      return;
    }

    const [hours, minutes] = formData.appointmentTime.split(":").map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    createMutation.mutate({
      ...formData,
      appointmentDate,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os agendamentos do salão
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Crie um novo agendamento para um cliente
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsQuery.data?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Serviço</label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, serviceId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesQuery.data?.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - R$ {service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Especialista</label>
                  <Select
                    value={formData.specialistId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialistId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um especialista" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialistsQuery.data?.map((specialist) => (
                        <SelectItem key={specialist.id} value={specialist.id}>
                          {specialist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Horário</label>
                  <Input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentTime: e.target.value,
                      })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar Agendamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Date Filter */}
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>
              {appointmentsQuery.data?.length || 0} agendamentos para{" "}
              {new Date(selectedDate).toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsQuery.isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : appointmentsQuery.data && appointmentsQuery.data.length > 0 ? (
              <div className="space-y-2">
                {appointmentsQuery.data.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{apt.appointmentTime}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cliente • Serviço • Especialista
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento para esta data
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

