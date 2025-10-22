import { useState } from "react";
import { useId } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

export default function Admin() {
    const nameId = useId();
    const emailId = useId();
    const passwordId = useId();
    const roleId = useId();

    // Estados para formulário de cadastro
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    // Estados para feedback
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const usersQuery = trpc.users.list.useQuery();
    const registerMutation = trpc.auth.register.useMutation();
    const editMutation = trpc.users.edit.useMutation();
    const resetPasswordMutation = trpc.users.resetPassword.useMutation();
    const deleteMutation = trpc.users.delete.useMutation();

    const refetchUsers = () => usersQuery.refetch();

    // Cadastro de usuário
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");
        setError("");
        if (!email || !name || !password) {
            setError("Preencha todos os campos!");
            return;
        }
        try {
            await registerMutation.mutateAsync({ name, email, password, role });
            setSuccess("Usuário cadastrado com sucesso!");
            setEmail(""); setName(""); setPassword(""); setRole("user");
            refetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Erro ao cadastrar usuário");
        }
    };

    // Função para resetar senha
    const handleResetPassword = async (id: string) => {
        const novaSenha = prompt("Digite a nova senha para este usuário:");
        if (!novaSenha) return;
        try {
            await resetPasswordMutation.mutateAsync({ id, password: novaSenha });
            setSuccess("Senha redefinida com sucesso!");
            refetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Erro ao redefinir senha");
        }
    };

    // Função para remover usuário
    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja remover este usuário? Essa ação não pode ser desfeita.")) return;
        try {
            await deleteMutation.mutateAsync({ id });
            setSuccess("Usuário removido com sucesso!");
            refetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Erro ao remover usuário");
        }
    };

    // Estados para modal de edição
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editUserData, setEditUserData] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });

    // Função para abrir modal de edição
    const openEditDialog = (user: { id: string; name: string; email: string; role: string }) => {
        setEditUserData(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setIsEditDialogOpen(true);
    };

    // Função para editar usuário via modal
    const handleEditUserModal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUserData) return;
        try {
            await editMutation.mutateAsync({ id: editUserData.id, data: editForm });
            setSuccess("Usuário editado com sucesso!");
            setIsEditDialogOpen(false);
            setEditUserData(null);
            refetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Erro ao editar usuário");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto mt-12">
                <Card className="shadow-xl border-none rounded-2xl bg-white/90 backdrop-blur-lg">
                    <CardHeader className="flex flex-col items-center gap-2 pb-0">
                        <CardTitle className="text-2xl font-bold mt-2">Administração de Usuários</CardTitle>
                        <CardDescription className="text-slate-500">Gerencie, edite e remova usuários do sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <form onSubmit={handleRegister} className="space-y-4 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={nameId} className="text-sm font-medium text-slate-700">Nome</label>
                                    <Input id={nameId} value={name} onChange={e => setName(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <label htmlFor={emailId} className="text-sm font-medium text-slate-700">Email</label>
                                    <Input id={emailId} type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <label htmlFor={passwordId} className="text-sm font-medium text-slate-700">Senha</label>
                                    <Input id={passwordId} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <label htmlFor={roleId} className="text-sm font-medium text-slate-700">Permissão</label>
                                    <select id={roleId} className="w-full p-2 rounded bg-slate-100 mt-1" value={role} onChange={e => setRole(e.target.value)}>
                                        <option value="user">Usuário</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition">Cadastrar Usuário</Button>
                            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                        </form>
                        <hr className="my-6" />
                        <p className="mb-2 font-semibold">Usuários cadastrados</p>
                        <div className="overflow-x-auto rounded-xl shadow">
                            <table className="w-full text-left mb-6 bg-slate-100 rounded-xl overflow-hidden">
                                <thead className="bg-slate-200">
                                    <tr>
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Permissão</th>
                                        <th className="p-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersQuery.data?.map(user => (
                                        <tr key={user.id} className="border-b last:border-none hover:bg-slate-50 transition">
                                            <td className="p-3 font-medium">{user.name}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}`}>{user.role === "admin" ? "Administrador" : "Usuário"}</span>
                                            </td>
                                            <td className="p-3 space-x-2">
                                                <Button size="icon" variant="secondary" onClick={() => openEditDialog(user)} aria-label="Editar">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="destructive" onClick={() => handleDeleteUser(user.id)} aria-label="Remover">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleResetPassword(user.id)}>
                                                    Resetar Senha
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {usersQuery.isLoading && <div className="text-center text-muted-foreground">Carregando usuários...</div>}
                        {usersQuery.isError && <div className="text-center text-red-600">Erro ao carregar usuários</div>}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Editar Usuário</DialogTitle>
                                    <DialogDescription>Atualize os dados do usuário</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleEditUserModal} className="space-y-4">
                                    <div>
                                        <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                                        <Input
                                            id="edit-name"
                                            className="w-full p-2 rounded bg-slate-100"
                                            value={editForm.name}
                                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                                        <Input
                                            id="edit-email"
                                            className="w-full p-2 rounded bg-slate-100"
                                            type="email"
                                            value={editForm.email}
                                            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-role" className="text-sm font-medium">Permissão</label>
                                        <select
                                            id="edit-role"
                                            className="w-full p-2 rounded bg-slate-100"
                                            value={editForm.role}
                                            onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition">Salvar Alterações</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
