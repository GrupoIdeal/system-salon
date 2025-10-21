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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialistId, setEditingSpecialistId] = useState<string | null>(null);
  const [specialistForm, setSpecialistForm] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
  });

  const salonQuery = trpc.salon.get.useQuery();
  const specialistsQuery = trpc.specialists.list.useQuery();

  const updateSalonMutation = trpc.salon.update.useMutation({
    onSuccess: () => {
      salonQuery.refetch();
    },
  });

  const createSpecialistMutation = trpc.specialists.create.useMutation({
    onSuccess: () => {
      specialistsQuery.refetch();
      setSpecialistForm({ name: "", specialty: "", email: "", phone: "" });
      setIsDialogOpen(false);
    },
  });

  const updateSpecialistMutation = trpc.specialists.update.useMutation({
    onSuccess: () => {
      specialistsQuery.refetch();
      setSpecialistForm({ name: "", specialty: "", email: "", phone: "" });
      setEditingSpecialistId(null);
      setIsDialogOpen(false);
    },
  });

  const deleteSpecialistMutation = trpc.specialists.delete.useMutation({
    onSuccess: () => {
      specialistsQuery.refetch();
    },
  });

  const handleSpecialistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialistForm.name) return;

    if (editingSpecialistId) {
      updateSpecialistMutation.mutate({
        id: editingSpecialistId,
        data: specialistForm,
      });
    } else {
      createSpecialistMutation.mutate(specialistForm);
    }
  };

  const handleEditSpecialist = (specialist: any) => {
    setSpecialistForm({
      name: specialist.name,
      specialty: specialist.specialty || "",
      email: specialist.email || "",
      phone: specialist.phone || "",
    });
    setEditingSpecialistId(specialist.id);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os dados do seu salão e especialistas
          </p>
        </div>

        <Tabs defaultValue="salon" className="w-full">
          <TabsList>
            <TabsTrigger value="salon">Dados do Salão</TabsTrigger>
            <TabsTrigger value="specialists">Especialistas</TabsTrigger>
          </TabsList>

          {/* Salon Data Tab */}
          <TabsContent value="salon" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Salão</CardTitle>
                <CardDescription>
                  Atualize os dados do seu salão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {salonQuery.isLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : salonQuery.data ? (
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome do Salão</label>
                      <Input
                        defaultValue={salonQuery.data.name}
                        placeholder="Nome do salão"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">CNPJ</label>
                      <Input
                        defaultValue={salonQuery.data.cnpj || ""}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Endereço</label>
                      <Input
                        defaultValue={salonQuery.data.address || ""}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Telefone</label>
                        <Input
                          defaultValue={salonQuery.data.phone || ""}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          defaultValue={salonQuery.data.email || ""}
                          placeholder="email@salao.com"
                        />
                      </div>
                    </div>
                    <Button
                      disabled={updateSalonMutation.isPending}
                      className="w-full"
                    >
                      {updateSalonMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar Alterações
                    </Button>
                  </form>
                ) : (
                  <p className="text-muted-foreground">Salão não encontrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specialists Tab */}
          <TabsContent value="specialists" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingSpecialistId(null);
                      setSpecialistForm({
                        name: "",
                        specialty: "",
                        email: "",
                        phone: "",
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Especialista
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSpecialistId
                        ? "Editar Especialista"
                        : "Novo Especialista"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSpecialistId
                        ? "Atualize os dados do especialista"
                        : "Adicione um novo especialista ao seu salão"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSpecialistSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={specialistForm.name}
                        onChange={(e) =>
                          setSpecialistForm({
                            ...specialistForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Nome do especialista"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Especialidade</label>
                      <Input
                        value={specialistForm.specialty}
                        onChange={(e) =>
                          setSpecialistForm({
                            ...specialistForm,
                            specialty: e.target.value,
                          })
                        }
                        placeholder="Ex: Cabeleireiro"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={specialistForm.email}
                        onChange={(e) =>
                          setSpecialistForm({
                            ...specialistForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <Input
                        value={specialistForm.phone}
                        onChange={(e) =>
                          setSpecialistForm({
                            ...specialistForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        createSpecialistMutation.isPending ||
                        updateSpecialistMutation.isPending
                      }
                    >
                      {(createSpecialistMutation.isPending ||
                        updateSpecialistMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingSpecialistId ? "Atualizar" : "Criar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Especialistas</CardTitle>
                <CardDescription>
                  Gerencie os especialistas do seu salão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {specialistsQuery.isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : specialistsQuery.data && specialistsQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {specialistsQuery.data.map((specialist) => (
                      <div
                        key={specialist.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{specialist.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {specialist.specialty || "Sem especialidade"} •{" "}
                            {specialist.email || "Sem email"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSpecialist(specialist)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              deleteSpecialistMutation.mutate({ id: specialist.id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum especialista cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

