import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Building2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Empresa() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    logo: "",
    name: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
  });

  // Busca dados da empresa (salon)
  const salonQuery = trpc.salon.get.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const updateMutation = trpc.salon.update.useMutation();

  useEffect(() => {
    if (salonQuery.data) {
      setForm({
        logo: salonQuery.data.logo || "",
        name: salonQuery.data.name || "",
        cnpj: salonQuery.data.cnpj || "",
        address: salonQuery.data.address || "",
        phone: salonQuery.data.phone || "",
        email: salonQuery.data.email || "",
      });
    }
  }, [salonQuery.data]);

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Acesso restrito</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Somente administradores podem visualizar os dados da empresa.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      setEditMode(false);
      salonQuery.refetch();
    } catch (error) {
      console.error("Erro ao salvar dados da empresa:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresa</h1>
          <p className="text-muted-foreground">
            Gerencie os dados básicos da empresa
          </p>
        </div>
        <div>
          {editMode ? (
            <Button
              type="button"
              className="px-6"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          ) : (
            <Button
              type="button"
              className="px-6"
              onClick={() => setEditMode(true)}
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={!editMode}
                  required
                  placeholder="Nome do salão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ/CPF</Label>
                <Input
                  id="cnpj"
                  value={form.cnpj}
                  onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
                  disabled={!editMode}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={e =>
                    setForm(f => ({ ...f, phone: e.target.value }))
                  }
                  disabled={!editMode}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e =>
                    setForm(f => ({ ...f, email: e.target.value }))
                  }
                  disabled={!editMode}
                  placeholder="contato@salao.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                value={form.address}
                onChange={e =>
                  setForm(f => ({ ...f, address: e.target.value }))
                }
                disabled={!editMode}
                placeholder="Rua, número, bairro, cidade - UF"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Os horários de funcionamento agora
                são configurados individualmente para cada especialista. Vá para
                a seção "Especialistas" para definir os horários de trabalho de
                cada profissional.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
