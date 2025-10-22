import { useState, useId } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

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
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const usersQuery = trpc.users.list.useQuery();
    const registerMutation = trpc.auth.register.useMutation();
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
            await registerMutation.mutateAsync({ name, email, password });
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
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro ao redefinir senha");
            }
        }
    };

    // Função para remover usuário
    const handleDeleteUser = async (id: string) => {
        try {
            await deleteMutation.mutateAsync({ id });
            setSuccess("Usuário removido com sucesso!");
            refetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Erro ao remover usuário");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Administradores</h1>
                    <p className="text-muted-foreground">Gerencie os administradores e colaboradores do sistema</p>
                </div>
                {/* Se quiser adicionar um botão de ação, insira aqui */}
            </div>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Cadastrar novo usuário</CardTitle>
                    <CardDescription>Preencha os dados para adicionar um novo administrador ou colaborador.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
                        <div>
                            <label htmlFor={nameId} className="block text-sm font-medium mb-1">Nome</label>
                            <Input id={nameId} value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor={emailId} className="block text-sm font-medium mb-1">E-mail</label>
                            <Input id={emailId} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor={passwordId} className="block text-sm font-medium mb-1">Senha</label>
                            <Input id={passwordId} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor={roleId} className="block text-sm font-medium mb-1">Função</label>
                            <select id={roleId} className="w-full border rounded px-2 py-1" value={role} onChange={e => setRole(e.target.value)}>
                                <option value="user">Colaborador</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex gap-2 mt-2">
                            <Button type="submit">Cadastrar</Button>
                            {registerMutation.status === "pending" && <Loader2 className="animate-spin ml-2" size={20} />}
                        </div>
                        {success && <div className="text-green-600 mt-2 col-span-2">{success}</div>}
                        {error && <div className="text-red-600 mt-2 col-span-2">{error}</div>}
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de usuários</CardTitle>
                    <CardDescription>Gerencie os administradores e colaboradores do sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    {usersQuery.isLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nome</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">E-mail</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Função</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {usersQuery.data?.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-2 text-sm">{user.name}</td>
                                            <td className="px-4 py-2 text-sm">{user.email}</td>
                                            <td className="px-4 py-2 text-sm">{user.role === 'admin' ? 'Administrador' : 'Colaborador'}</td>
                                            <td className="px-4 py-2 flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)} title="Redefinir senha">
                                                    <Pencil size={16} className="mr-1" />
                                                    Senha
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleteId(user.id)} title="Remover">
                                                    <Trash2 size={16} className="mr-1" />
                                                    Remover
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de confirmação para remover usuário */}
            <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                    <AlertDialogDescription>Tem certeza que deseja remover este usuário? Essa ação não pode ser desfeita.</AlertDialogDescription>
                    <div className="flex gap-2 mt-4">
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { if (deleteId) handleDeleteUser(deleteId); setDeleteId(null); }}>Remover</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
