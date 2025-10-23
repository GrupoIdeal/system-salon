// Página de Especialistas - CRUD
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Edit, Trash2, User2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Specialists() {
    const nameId = useId();
    const specialtyId = useId();
    const phoneId = useId();
    const emailId = useId();
    const bioId = useId();

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        phone: "",
        photo: "",
        specialty: "",
        bio: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [specialistToDelete, setSpecialistToDelete] = useState<string | null>(null);

    const specialistsQuery = trpc.specialists.list.useQuery();
    const createMutation = trpc.specialists.create.useMutation({
        onSuccess: () => {
            specialistsQuery.refetch();
            resetForm();
        },
    });
    const updateMutation = trpc.specialists.update.useMutation({
        onSuccess: () => {
            specialistsQuery.refetch();
            resetForm();
            setIsEditing(false);
        },
    });
    const deleteMutation = trpc.specialists.delete.useMutation({
        onSuccess: () => {
            specialistsQuery.refetch();
            setIsDeleteDialogOpen(false);
            setSpecialistToDelete(null);
        },
    });

    // Função para resetar o formulário
    const resetForm = () => {
        setFormData({
            id: "",
            name: "",
            email: "",
            phone: "",
            photo: "",
            specialty: "",
            bio: ""
        });
    };

    // Função para lidar com upload de imagem (simples, base64)
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData({ ...formData, photo: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
    };

    // Função para editar um especialista
    const handleEditSpecialist = (specialist: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        photo?: string;
        specialty?: string;
        bio?: string;
    }) => {
        setFormData({
            id: specialist.id,
            name: specialist.name,
            email: specialist.email || "",
            phone: specialist.phone || "",
            photo: specialist.photo || "",
            specialty: specialist.specialty || "",
            bio: specialist.bio || "",
        });
        setIsEditing(true);
    };

    // Função para confirmar exclusão
    const confirmDelete = (id: string) => {
        setSpecialistToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    // Função para excluir especialista
    const handleDeleteSpecialist = () => {
        if (specialistToDelete) {
            deleteMutation.mutate({ id: specialistToDelete });
        }
    };

    // Função para cancelar edição
    const handleCancelEdit = () => {
        resetForm();
        setIsEditing(false);
    };

    // Função de submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const specialistData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            photo: formData.photo,
            specialty: formData.specialty,
            bio: formData.bio,
            status: "active" as const,
        };

        if (isEditing && formData.id) {
            updateMutation.mutate({
                id: formData.id,
                data: specialistData,
            });
        } else {
            createMutation.mutate(specialistData);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Especialistas</h1>
                    <p className="text-muted-foreground">Gerencie os profissionais do salão</p>
                </div>
            </div>
            <div className="w-full">
                <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-10">
                    {/* Formulário de cadastro */}
                    <Card className="flex-1 shadow-xl border-none rounded-2xl bg-white/90 backdrop-blur-lg">
                        <CardHeader className="flex flex-col items-center gap-2 pb-0">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative group cursor-pointer">
                                    <label className="block">
                                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-100 to-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Foto do especialista" className="w-full h-full object-cover" />
                                            ) : (
                                                <User2 className="h-16 w-16 text-slate-400" />
                                            )}
                                            <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">Alterar foto</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-gray-600 font-bold mt-2">
                                {isEditing ? "Editar Especialista" : "Novo Especialista"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <form onSubmit={handleSubmit} className="space-y-4 mb-8 ">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor={nameId} className="text-sm font-medium text-slate-700">Nome</label>
                                        <Input id={nameId} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1" required autoFocus />
                                    </div>
                                    <div>
                                        <label htmlFor={specialtyId} className="text-sm font-medium text-slate-700">Especialidade</label>
                                        <Input id={specialtyId} value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} placeholder="Ex: Cabeleireira, Manicure..." className="mt-1" required />
                                    </div>
                                    <div>
                                        <label htmlFor={phoneId} className="text-sm font-medium text-slate-700">Telefone</label>
                                        <Input id={phoneId} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1" required />
                                    </div>
                                    <div>
                                        <label htmlFor={emailId} className="text-sm font-medium text-slate-700">Email</label>
                                        <Input id={emailId} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor={bioId} className="text-sm font-medium text-slate-700">Bio</label>
                                    <textarea id={bioId} className="w-full min-h-[60px] rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 mt-1" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Breve descrição do profissional" />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {isEditing ? "Atualizar" : "Salvar"}
                                    </Button>
                                    {isEditing && (
                                        <Button type="button" onClick={handleCancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition">
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    {/* Listagem dos especialistas */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-6 text-gray-600">Especialistas cadastrados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {specialistsQuery.isLoading && <div>Carregando...</div>}
                            {specialistsQuery.data?.length === 0 && <div className="col-span-full text-center text-muted-foreground">Nenhum especialista cadastrado.</div>}
                            {specialistsQuery.data?.map((spec) => (
                                <Card key={spec.id} className="flex items-center gap-6 p-6 shadow rounded-xl border border-muted bg-white">
                                    <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                                        {spec.photo ? (
                                            <AvatarImage src={spec.photo} alt={spec.name} className="object-cover" />
                                        ) : (
                                            <AvatarFallback><User2 className="h-12 w-12 text-muted-foreground " /></AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-gray-600 mb-1">{spec.name}</div>
                                        <div className="text-muted-foreground text-sm mb-1">{spec.specialty}</div>
                                        <div className="text-muted-foreground text-sm">{spec.email}</div>
                                        <div className="text-muted-foreground text-sm mb-2">{spec.phone}</div>
                                        {spec.bio && <div className="text-xs text-muted-foreground italic mt-2">{spec.bio}</div>}
                                    </div>
                                    <div className="flex flex-row gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 px-4 py-2 text-blue-700 border-blue-300 hover:bg-blue-50 hover:text-blue-900 font-medium rounded-lg shadow-sm"
                                            onClick={() => handleEditSpecialist({
                                                id: spec.id,
                                                name: spec.name,
                                                email: spec.email,
                                                phone: spec.phone,
                                                photo: spec.photo,
                                                specialty: spec.specialty,
                                                bio: spec.bio,
                                            })}
                                        >
                                            <Edit size={18} className="mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 px-4 py-2 text-red-700 border-red-300 hover:bg-red-50 hover:text-red-900 font-medium rounded-lg shadow-sm"
                                            onClick={() => confirmDelete(spec.id)}
                                        >
                                            <Trash2 size={18} className="mr-1" />
                                            Excluir
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog de confirmação para excluir */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este especialista?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSpecialist} className="bg-red-600 text-white hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
