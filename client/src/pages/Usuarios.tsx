import { useState, useEffect, useId } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const AVAILABLE_PERMISSIONS = [
    { key: "manage_clients", label: "Gerenciar clientes" },
    { key: "manage_services", label: "Gerenciar serviços" },
    { key: "manage_specialists", label: "Gerenciar especialistas" },
    { key: "manage_appointments", label: "Gerenciar agendamentos" },
    { key: "manage_users", label: "Gerenciar usuários" },
];

export default function Usuarios() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        permissions: {} as Record<string, boolean>,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const idName = useId();
    const idEmail = useId();
    const idPassword = useId();
    const idRole = useId();

    const createMutation = trpc.users.create.useMutation({
        onSuccess: () => {
            listQuery.refetch();
            setIsDialogOpen(false);
            toast.success("Usuário criado com sucesso");
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err) || "Erro ao criar usuário");
        },
    });
    const editMutation = trpc.users.edit.useMutation({
        onSuccess: () => {
            listQuery.refetch();
            setIsDialogOpen(false);
            setEditingId(null);
            toast.success("Usuário atualizado");
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err) || "Erro ao atualizar usuário");
        },
    });
    const deleteMutation = trpc.users.delete.useMutation({
        onSuccess: () => {
            listQuery.refetch();
            setConfirmDeleteId(null);
            toast.success("Usuário removido");
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err) || "Erro ao remover usuário");
        },
    });
    const resetPasswordMutation = trpc.users.resetPassword.useMutation({
        onSuccess: () => {
            toast.success("Senha atualizada com sucesso");
        },
        onError: (err: unknown) => {
            toast.error(getErrorMessage(err) || "Erro ao atualizar senha");
        },
    });
    const listQuery = trpc.users.list.useQuery(undefined, { enabled: !!user && user.role === "admin" });

    useEffect(() => {
        // reset permissions when role is admin (server gives full perms)
        if (form.role === "admin") {
            setForm(f => ({ ...f, permissions: {} }));
        }
    }, [form.role]);

    if (!user || user.role !== "admin") {
        return (
            <DashboardLayout>
                <div className="max-w-lg mx-auto mt-12 text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Acesso restrito</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Somente administradores podem criar usuários.</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const togglePermission = (key: string) => {
        setForm(f => ({
            ...f,
            permissions: { ...f.permissions, [key]: !f.permissions[key] },
        }));
    };

    const openNewUserDialog = () => {
        setEditingId(null);
        setForm({ name: "", email: "", password: "", role: "user", permissions: {} });
        setIsDialogOpen(true);
    };

    const handleEditClick = (u: { id: string; name?: string; email?: string; role?: string; permissions?: Record<string, boolean> | null; }) => {
        setEditingId(u.id);
        setForm({
            name: u.name || "",
            email: u.email || "",
            password: "",
            role: u.role || "user",
            permissions: u.permissions || {},
        });
        setIsDialogOpen(true);
    };

    const handleDeleteConfirm = (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        await deleteMutation.mutateAsync({ id: confirmDeleteId });
    };

    const handleResetPassword = async (id: string) => {
        const pw = prompt("Digite a nova senha para o usuário (mínimo 6 caracteres)", "changeme");
        if (!pw || pw.length < 6) return toast.error("Senha inválida");
        await resetPasswordMutation.mutateAsync({ id, password: pw });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!editingId) {
                // criação
                const payload = {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role as "user" | "admin",
                    ...(form.role !== "admin" ? { permissions: form.permissions } : {}),
                };

                await createMutation.mutateAsync(payload);
            } else {
                // edição
                const data: Record<string, unknown> = {};
                if (form.name) data.name = form.name;
                if (form.email) data.email = form.email;
                if (form.role) data.role = form.role;
                if (Object.keys(form.permissions || {}).length > 0) data.permissions = form.permissions;

                await editMutation.mutateAsync({ id: editingId, data });
            }

            setForm({ name: "", email: "", password: "", role: "user", permissions: {} });
            listQuery.refetch();
        } catch {
            // Erro será tratado pelo React Query e exibido em toast
            toast.error("Erro ao salvar usuário");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
                        <p className="text-muted-foreground mt-2">Criar e gerenciar usuários do sistema</p>
                    </div>
                    <div>
                        <Button onClick={openNewUserDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
                        </Button>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                            <DialogDescription>
                                {editingId ? "Atualize os dados do usuário" : "Crie um novo usuário"}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={idName}>Nome</Label>
                                    <Input id={idName} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                </div>
                                <div>
                                    <Label htmlFor={idEmail}>Email</Label>
                                    <Input id={idEmail} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                                {!editingId && (
                                    <div>
                                        <Label htmlFor={idPassword}>Senha</Label>
                                        <Input id={idPassword} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor={idRole}>Perfil</Label>
                                    <select id={idRole} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border rounded px-2 py-1">
                                        <option value="user">Usuário</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label>Permissões específicas</Label>
                                <p className="text-sm text-muted-foreground mb-2">Marque permissões específicas para este usuário. Administradores recebem permissões totais automaticamente.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {AVAILABLE_PERMISSIONS.map(p => (
                                        <label key={p.key} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={!!form.permissions[p.key]}
                                                onChange={() => togglePermission(p.key)}
                                                disabled={form.role === "admin"}
                                            />
                                            <span>{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => { setIsDialogOpen(false); setEditingId(null); }}>Cancelar</Button>
                                <Button type="submit" disabled={createMutation.isPending || editMutation.isPending}>
                                    {(createMutation.isPending || editMutation.isPending) ? "Salvando..." : (editingId ? "Atualizar" : "Criar")}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de usuários</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {listQuery.isLoading ? (
                            <p>Carregando...</p>
                        ) : (
                            <div className="space-y-2">
                                {listQuery.data?.map(u => (
                                    <div key={u.id} className="p-3 border rounded flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{u.name}</div>
                                            <div className="text-sm text-muted-foreground">{u.email} • {u.role}</div>
                                            {u.permissions && Object.keys(u.permissions).length > 0 && (
                                                <div className="text-xs mt-1 text-muted-foreground">Permissões: {Object.keys(u.permissions).filter(k => (u.permissions as Record<string, boolean>)[k]).join(", ")}</div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(u)}>
                                                <Edit2 className="h-4 w-4 mr-1" /> Editar
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm(u.id)} disabled={u.id === user.id}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" onClick={() => handleResetPassword(u.id)}>Resetar senha</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <AlertDialog open={!!confirmDeleteId} onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</AlertDialogDescription>
                        <div className="flex justify-end gap-2 mt-4">
                            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Excluir</AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </DashboardLayout>
    );
}
