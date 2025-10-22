import { useState } from "react";
import { useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
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

    const usersQuery = trpc.users.list.useQuery();

    // Função de cadastro usando TRPC
    const registerMutation = trpc.auth.register.useMutation();
    const editMutation = trpc.users.edit.useMutation();
    const resetPasswordMutation = trpc.users.resetPassword.useMutation();

    // Refetch automático após cadastro, edição ou reset
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

    // Função para editar usuário
    const handleEditUser = async (user: { id: string; name: string; email: string; role: string }) => {
        const novoNome = prompt("Novo nome:", user.name);
        const novoEmail = prompt("Novo email:", user.email);
        const novaRole = prompt("Nova permissão (user/admin):", user.role);
        if (!novoNome || !novoEmail || !novaRole) return;
        try {
            await editMutation.mutateAsync({ id: user.id, data: { name: novoNome, email: novoEmail, role: novaRole } });
            setSuccess("Usuário editado com sucesso!");
            refetchUsers();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Erro ao editar usuário");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
                <Card className="w-full max-w-2xl shadow-xl">
                    <CardHeader>
                        <CardTitle>Administração de Usuários</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4 mb-8">
                            <div className="space-y-2">
                                <label htmlFor={nameId} className="text-sm font-medium">Nome</label>
                                <input id={nameId} className="w-full p-2 rounded bg-slate-100" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={emailId} className="text-sm font-medium">Email</label>
                                <input id={emailId} className="w-full p-2 rounded bg-slate-100" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={passwordId} className="text-sm font-medium">Senha</label>
                                <input id={passwordId} className="w-full p-2 rounded bg-slate-100" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={roleId} className="text-sm font-medium">Permissão</label>
                                <select id={roleId} className="w-full p-2 rounded bg-slate-100" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full">Cadastrar Usuário</Button>
                            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                        </form>
                        <hr className="my-6" />
                        <p className="mb-2 font-semibold">Usuários cadastrados</p>
                        <table className="w-full text-left mb-6 bg-slate-100 rounded-lg overflow-hidden">
                            <thead className="bg-slate-200">
                                <tr>
                                    <th className="p-2">Nome</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Permissão</th>
                                    <th className="p-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersQuery.data?.map(user => (
                                    <tr key={user.id}>
                                        <td className="p-2">{user.name}</td>
                                        <td className="p-2">{user.email}</td>
                                        <td className="p-2">{user.role}</td>
                                        <td className="p-2 space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => handleResetPassword(user.id)}>Resetar Senha</Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleEditUser(user)}>Editar</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {usersQuery.isLoading && <div className="text-center text-muted-foreground">Carregando usuários...</div>}
                        {usersQuery.isError && <div className="text-center text-red-600">Erro ao carregar usuários</div>}
                        <p className="mb-2 font-semibold">Funções de reset de senha e gerenciamento de usuários aqui.</p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
