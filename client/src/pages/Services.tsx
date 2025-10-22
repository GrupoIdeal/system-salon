import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string;
  status: "active" | "inactive" | null;
  specialistId: string | null;
}

export default function Services() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    duration: string;
    price: string;
    status: "active" | "inactive";
    specialistId: string;
  }>({
    name: "",
    description: "",
    duration: "60",
    price: "",
    status: "active",
    specialistId: "none",
  });

  const servicesQuery = trpc.services.list.useQuery();
  const specialistsQuery = trpc.specialists.list.useQuery();

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      servicesQuery.refetch();
      setFormData({
        name: "",
        description: "",
        duration: "60",
        price: "",
        status: "active",
        specialistId: "none",
      });
      setIsDialogOpen(false);
    },
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      servicesQuery.refetch();
      setFormData({
        name: "",
        description: "",
        duration: "60",
        price: "",
        status: "active",
        specialistId: "none",
      });
      setEditingId(null);
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      servicesQuery.refetch();
      setDeleteId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
        },
      });
    } else {
      createMutation.mutate({
        ...formData,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
      });
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description ?? "",
      duration: service.duration.toString(),
      price: service.price,
      status: service.status ?? "active",
      specialistId: service.specialistId ? service.specialistId : "none",
    });
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os serviços oferecidos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    description: "",
                    duration: "60",
                    price: "",
                    status: "active",
                    specialistId: "none",
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize os dados do serviço"
                    : "Adicione um novo serviço ao sistema"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Corte de cabelo"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do serviço"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="text-sm font-medium">Duração (min)</label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="60"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="text-sm font-medium">Preço (R$)</label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <fieldset className="mb-4">
                  <legend className="text-sm font-medium mb-1">Status</legend>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "active" | "inactive",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </fieldset>

                <fieldset className="mb-4">
                  <legend className="text-sm font-medium mb-1">Especialista Responsável (opcional)</legend>
                  <Select
                    value={formData.specialistId}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        specialistId: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um especialista (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum especialista</SelectItem>
                      {specialistsQuery.data?.map((specialist) => (
                        <SelectItem key={specialist.id} value={specialist.id}>
                          {specialist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </fieldset>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesQuery.isLoading ? (
            [1, 2, 3].map((item) => (
              <Skeleton key={`skeleton-service-${item}`} className="h-48 w-full" />
            ))
          ) : servicesQuery.data && servicesQuery.data.length > 0 ? (
            servicesQuery.data.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${service.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {service.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duração</p>
                      <p className="font-semibold">{service.duration} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preço</p>
                      <p className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(service.price))}
                      </p>
                    </div>
                  </div>

                  {service.specialistId && (
                    <div className="text-sm border-t pt-2 mt-2">
                      <p className="text-muted-foreground">Especialista</p>
                      <p className="font-semibold">
                        {specialistsQuery.data?.find(s => s.id === service.specialistId)?.name || service.specialistId}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhum serviço encontrado</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Deletar serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O serviço será removido do sistema.
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Deletar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

