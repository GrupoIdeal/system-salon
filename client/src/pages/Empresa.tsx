import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Trash2, Clock } from "lucide-react";

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
        workingHours: {} as Record<string, Array<{ start: string; end: string; lunch?: { start: string; end: string } }>>,
    });
    const [newHour, setNewHour] = useState<{ start: string; end: string; lunchStart: string; lunchEnd: string }>({ start: "", end: "", lunchStart: "", lunchEnd: "" });
    const [selectedDay, setSelectedDay] = useState<string>("");

    // Busca dados da empresa (salon)
    const salonQuery = trpc.salon.get.useQuery(undefined, { enabled: user?.role === "admin" });
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
                workingHours: salonQuery.data.workingHours || {},
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
                            <p>Somente administradores podem visualizar os dados da empresa.</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateMutation.mutateAsync(form);
        setEditMode(false);
        salonQuery.refetch();
    };

    // Adiciona horário para o dia
    const handleAddHour = (day: string) => {
        if (!newHour.start || !newHour.end) return;
        setForm(f => ({
            ...f,
            workingHours: {
                ...f.workingHours,
                [day]: [
                    ...(f.workingHours[day] || []),
                    {
                        start: newHour.start,
                        end: newHour.end,
                        lunch: newHour.lunchStart && newHour.lunchEnd ? { start: newHour.lunchStart, end: newHour.lunchEnd } : undefined,
                    },
                ],
            },
        }));
        setNewHour({ start: "", end: "", lunchStart: "", lunchEnd: "" });
    };

    // Remove horário específico
    const handleRemoveHour = (day: string, idx: number) => {
        setForm(f => {
            const wh = { ...f.workingHours };
            wh[day] = wh[day].filter((_, i) => i !== idx);
            return { ...f, workingHours: wh };
        });
    };

    // Mapeamento dos dias da semana do backend para o frontend
    const diasSemana = [
        { key: "monday", label: "Segunda-feira" },
        { key: "tuesday", label: "Terça-feira" },
        { key: "wednesday", label: "Quarta-feira" },
        { key: "thursday", label: "Quinta-feira" },
        { key: "friday", label: "Sexta-feira" },
        { key: "saturday", label: "Sábado" },
        { key: "sunday", label: "Domingo" },
    ];

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Empresa</h1>
                    <p className="text-muted-foreground">Gerencie os dados e horários do salão</p>
                </div>
            </div>
            <div className="w-full mx-auto mt-8">
                <div className="flex justify-end mb-4">
                    {editMode ? (
                        <Button type="button" className="px-6" onClick={handleSubmit}>
                            Salvar Alterações
                        </Button>
                    ) : (
                        <Button type="button" className="px-6" onClick={() => setEditMode(true)}>
                            Editar
                        </Button>
                    )}
                </div>
                <Card className="w-full mb-8">
                    <CardHeader>
                        <CardTitle>Dados da Empresa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* ...dados básicos... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-medium">Nome</label>
                                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editMode} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium">CNPJ/CPF</label>
                                <Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} disabled={!editMode} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Endereço</label>
                                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!editMode} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Telefone</label>
                                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editMode} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!editMode} />
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-4">Horários de Funcionamento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {diasSemana.slice(0, 6).map(({ key, label }) => (
                                    <Card key={key}>
                                        <CardHeader className="flex flex-row items-center gap-2 py-2">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold text-base">{label}</span>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {(form.workingHours[key] && form.workingHours[key].length > 0) ? (
                                                form.workingHours[key].map((wh, whIdx) => (
                                                    <div key={whIdx} className="flex flex-wrap items-center gap-4 mb-2">
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-sm">Início:</span>
                                                            <Input type="time" value={wh.start} disabled className="w-24" />
                                                            <span className="text-sm">Fim:</span>
                                                            <Input type="time" value={wh.end} disabled className="w-24" />
                                                        </div>
                                                        {wh.lunch && (
                                                            <div className="flex gap-2 items-center">
                                                                <span className="text-sm text-muted-foreground">Almoço:</span>
                                                                <Input type="time" value={wh.lunch.start} disabled className="w-20" />
                                                                <span className="text-sm">-</span>
                                                                <Input type="time" value={wh.lunch.end} disabled className="w-20" />
                                                            </div>
                                                        )}
                                                        {editMode && (
                                                            <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveHour(key, whIdx)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs">Nenhum horário cadastrado</span>
                                            )}
                                            {editMode && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Input type="time" value={selectedDay === key ? newHour.start : ""} onChange={e => { setSelectedDay(key); setNewHour(n => ({ ...n, start: e.target.value })); }} placeholder="Início" className="w-24" />
                                                    <Input type="time" value={selectedDay === key ? newHour.end : ""} onChange={e => { setSelectedDay(key); setNewHour(n => ({ ...n, end: e.target.value })); }} placeholder="Fim" className="w-24" />
                                                    <Input type="time" value={selectedDay === key ? newHour.lunchStart : ""} onChange={e => { setSelectedDay(key); setNewHour(n => ({ ...n, lunchStart: e.target.value })); }} placeholder="Almoço início" className="w-20" />
                                                    <Input type="time" value={selectedDay === key ? newHour.lunchEnd : ""} onChange={e => { setSelectedDay(key); setNewHour(n => ({ ...n, lunchEnd: e.target.value })); }} placeholder="Almoço fim" className="w-20" />
                                                    <Button type="button" size="sm" onClick={() => { setSelectedDay(key); handleAddHour(key); }}>
                                                        + Adicionar Horário
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Card key={diasSemana[6].key} className="w-full">
                                    <CardHeader className="flex flex-row items-center gap-2 py-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-semibold text-base">{diasSemana[6].label}</span>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {(form.workingHours[diasSemana[6].key] && form.workingHours[diasSemana[6].key].length > 0) ? (
                                            form.workingHours[diasSemana[6].key].map((wh, whIdx) => (
                                                <div key={whIdx} className="flex flex-wrap items-center gap-4 mb-2">
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-sm">Início:</span>
                                                        <Input type="time" value={wh.start} disabled className="w-24" />
                                                        <span className="text-sm">Fim:</span>
                                                        <Input type="time" value={wh.end} disabled className="w-24" />
                                                    </div>
                                                    {wh.lunch && (
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-sm text-muted-foreground">Almoço:</span>
                                                            <Input type="time" value={wh.lunch.start} disabled className="w-20" />
                                                            <span className="text-sm">-</span>
                                                            <Input type="time" value={wh.lunch.end} disabled className="w-20" />
                                                        </div>
                                                    )}
                                                    {editMode && (
                                                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveHour(diasSemana[6].key, whIdx)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Nenhum horário cadastrado</span>
                                        )}
                                        {editMode && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Input type="time" value={selectedDay === diasSemana[6].key ? newHour.start : ""} onChange={e => { setSelectedDay(diasSemana[6].key); setNewHour(n => ({ ...n, start: e.target.value })); }} placeholder="Início" className="w-24" />
                                                <Input type="time" value={selectedDay === diasSemana[6].key ? newHour.end : ""} onChange={e => { setSelectedDay(diasSemana[6].key); setNewHour(n => ({ ...n, end: e.target.value })); }} placeholder="Fim" className="w-24" />
                                                <Input type="time" value={selectedDay === diasSemana[6].key ? newHour.lunchStart : ""} onChange={e => { setSelectedDay(diasSemana[6].key); setNewHour(n => ({ ...n, lunchStart: e.target.value })); }} placeholder="Almoço início" className="w-20" />
                                                <Input type="time" value={selectedDay === diasSemana[6].key ? newHour.lunchEnd : ""} onChange={e => { setSelectedDay(diasSemana[6].key); setNewHour(n => ({ ...n, lunchEnd: e.target.value })); }} placeholder="Almoço fim" className="w-20" />
                                                <Button type="button" size="sm" onClick={() => { setSelectedDay(diasSemana[6].key); handleAddHour(diasSemana[6].key); }}>
                                                    + Adicionar Horário
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
