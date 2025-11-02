// Sistema de Lista de Espera - Frontend
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  Users,
  Plus,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface WaitlistManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistManagement({
  isOpen,
  onClose,
}: WaitlistManagementProps) {
  const [selectedTab, setSelectedTab] = useState<"list" | "add" | "stats">(
    "list"
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const waitlistQuery = trpc.waitlist.list.useQuery({});
  const statsQuery = trpc.waitlist.stats.useQuery();
  // clients/services/specialists queries are used inside the Add modal only

  const removeFromWaitlistMutation = trpc.waitlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Cliente removido da lista de espera!");
      waitlistQuery.refetch();
      statsQuery.refetch();
    },
    onError: error => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const confirmWaitlistMutation = trpc.waitlist.confirm.useMutation({
    onSuccess: result => {
      if (result.success) {
        toast.success("Horário confirmado com sucesso!");
        waitlistQuery.refetch();
        statsQuery.refetch();
      } else {
        toast.error(result.error || "Erro ao confirmar horário");
      }
    },
    onError: error => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Ativo
          </Badge>
        );
      case "notified":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Notificado
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Confirmado
          </Badge>
        );
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="destructive">Alta</Badge>;
      case 2:
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Média
          </Badge>
        );
      case 3:
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getNotificationIcon = (preference: string) => {
    switch (preference) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case "sms":
        return <Phone className="h-4 w-4 text-blue-600" />;
      case "email":
        return <Mail className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Espera
          </DialogTitle>
          <DialogDescription>
            Gerencie a lista de espera para horários indisponíveis
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          {[
            { id: "list", label: "Lista", icon: Users },
            { id: "add", label: "Adicionar", icon: Plus },
            { id: "stats", label: "Estatísticas", icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={selectedTab === id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTab(id as "list" | "add" | "stats")}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Lista de Espera */}
        {selectedTab === "list" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Clientes na Lista de Espera
              </h3>
              <Button onClick={() => setShowAddModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            </div>

            {waitlistQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : waitlistQuery.data && waitlistQuery.data.length > 0 ? (
              <Table>
                <TableCaption>
                  {waitlistQuery.data.length} cliente(s) na lista de espera
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preferências</TableHead>
                    <TableHead>Notificação</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistQuery.data.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            Cliente #{entry.clientId.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          Serviço #{entry.serviceId.slice(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell>{getPriorityBadge(entry.priority)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {entry.preferredDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(entry.preferredDate).toLocaleDateString(
                                "pt-BR"
                              )}
                            </div>
                          )}
                          {entry.preferredTimeStart && entry.preferredTimeEnd && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.preferredTimeStart} -{" "}
                              {entry.preferredTimeEnd}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getNotificationIcon(entry.notificationPreference)}
                          <span className="text-sm capitalize">
                            {entry.notificationPreference}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.status === "notified" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                confirmWaitlistMutation.mutate({
                                  waitlistId: entry.id,
                                })
                              }
                              disabled={confirmWaitlistMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              removeFromWaitlistMutation.mutate({
                                waitlistId: entry.id,
                              })
                            }
                            disabled={removeFromWaitlistMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente na lista de espera</p>
              </div>
            )}
          </div>
        )}

        {/* Estatísticas */}
        {selectedTab === "stats" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Estatísticas da Lista de Espera
            </h3>

            {statsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : statsQuery.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsQuery.data.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Clientes na lista
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ativos
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {statsQuery.data.active}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Aguardando horário
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Notificados
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {statsQuery.data.notified}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Aguardando confirmação
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Confirmados
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {statsQuery.data.confirmed}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Agendamentos feitos
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Erro ao carregar estatísticas</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* Modal para Adicionar à Lista de Espera */}
      <AddToWaitlistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          waitlistQuery.refetch();
          statsQuery.refetch();
        }}
      />
    </Dialog>
  );
}

// Modal para adicionar cliente à lista de espera
interface AddToWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddToWaitlistModal({
  isOpen,
  onClose,
  onSuccess,
}: AddToWaitlistModalProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    specialistId: "",
    preferredDate: "",
    preferredTimeStart: "",
    preferredTimeEnd: "",
    maxWaitDays: 7,
    notificationPreference: "whatsapp" as "sms" | "whatsapp" | "email",
    priority: 2,
  });

  const clientsQuery = trpc.clients.list.useQuery({});
  const servicesQuery = trpc.services.list.useQuery();
  const specialistsQuery = trpc.specialists.list.useQuery();

  const addToWaitlistMutation = trpc.waitlist.add.useMutation({
    onSuccess: () => {
      toast.success("Cliente adicionado à lista de espera!");
      onSuccess();
      onClose();
      setFormData({
        clientId: "",
        serviceId: "",
        specialistId: "",
        preferredDate: "",
        preferredTimeStart: "",
        preferredTimeEnd: "",
        maxWaitDays: 7,
        notificationPreference: "whatsapp",
        priority: 2,
      });
    },
    onError: error => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.serviceId) {
      toast.error("Cliente e serviço são obrigatórios");
      return;
    }

    const submitData: {
      clientId: string;
      serviceId: string;
      specialistId?: string;
      preferredDate?: Date;
      preferredTimeStart?: string;
      preferredTimeEnd?: string;
      maxWaitDays?: number;
      notificationPreference?: "sms" | "whatsapp" | "email";
      priority?: number;
    } = {
      clientId: formData.clientId,
      serviceId: formData.serviceId,
      maxWaitDays: formData.maxWaitDays,
      notificationPreference: formData.notificationPreference as
        | "sms"
        | "whatsapp"
        | "email",
      priority: formData.priority,
    };

    if (formData.specialistId) {
      submitData.specialistId = formData.specialistId;
    }

    if (formData.preferredDate) {
      submitData.preferredDate = new Date(formData.preferredDate);
    }

    if (formData.preferredTimeStart) {
      submitData.preferredTimeStart = formData.preferredTimeStart;
    }

    if (formData.preferredTimeEnd) {
      submitData.preferredTimeEnd = formData.preferredTimeEnd;
    }

    addToWaitlistMutation.mutate(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
          <DialogDescription>
            Adicione um cliente à lista de espera para ser notificado quando
            houver horário disponível
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select
              value={formData.clientId}
              onValueChange={value =>
                setFormData({ ...formData, clientId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientsQuery.data?.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Serviço *</Label>
            <Select
              value={formData.serviceId}
              onValueChange={value =>
                setFormData({ ...formData, serviceId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicesQuery.data?.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - R$ {service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialist">Especialista (opcional)</Label>
            <Select
              value={formData.specialistId}
              onValueChange={value =>
                setFormData({ ...formData, specialistId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer especialista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer especialista</SelectItem>
                {specialistsQuery.data?.map(specialist => (
                  <SelectItem key={specialist.id} value={specialist.id}>
                    {specialist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxWaitDays">Máx. dias de espera</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.maxWaitDays}
                onChange={e =>
                  setFormData({
                    ...formData,
                    maxWaitDays: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={value =>
                  setFormData({ ...formData, priority: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Alta</SelectItem>
                  <SelectItem value="2">Média</SelectItem>
                  <SelectItem value="3">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationPreference">
              Notificação preferida
            </Label>
            <Select
              value={formData.notificationPreference}
              onValueChange={(value: "whatsapp" | "sms" | "email") =>
                setFormData({ ...formData, notificationPreference: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={addToWaitlistMutation.isPending}>
              {addToWaitlistMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
