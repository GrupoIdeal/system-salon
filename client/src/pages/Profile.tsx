import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const meQuery = trpc.auth.me.useQuery();
  const editMutation = trpc.users.edit.useMutation();

  // Formulário de dados do usuário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Exibir foto do banco ao carregar perfil
  useEffect(() => {
    if (meQuery.data) {
      setName(meQuery.data.name || "");
      setEmail(meQuery.data.email || "");
      setPhone(meQuery.data.phone || "");
      setProfileImage(meQuery.data.photoUrl || "");
    }
  }, [meQuery.data]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!meQuery.data?.id) {
      setError("Usuário não carregado!");
      return;
    }
    try {
      await editMutation.mutateAsync({ id: meQuery.data.id, data: { name, email, phone, photoUrl: profileImage } });
      setSuccess("Dados atualizados com sucesso!");
      meQuery.refetch();
    } catch {
      setError("Erro ao atualizar dados");
    }
  };

  // Salvar foto no banco ao fazer upload
  const handleImageSave = async (url: string) => {
    if (!meQuery.data?.id) return;
    try {
      await editMutation.mutateAsync({ id: meQuery.data.id, data: { photoUrl: url } });
      setSuccess("Foto atualizada!");
      meQuery.refetch();
    } catch {
      setError("Erro ao salvar foto");
    }
  };

  // Upload para Cloudinary
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setUploading(true);
    setSuccess("");
    setError("");
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    formData.append("upload_preset", "default"); // configure um preset no painel Cloudinary
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dvq5a1chd/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Erro Cloudinary: ${data.error?.message || 'Falha no upload'}`);
        return;
      }
      if (!data.secure_url) {
        setError("Cloudinary não retornou URL da imagem");
        return;
      }
      setProfileImage(data.secure_url);
      handleImageSave(data.secure_url);
    } catch (err) {
      setError("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }, [meQuery.data]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  // Troca de senha
  const changePasswordMutation = trpc.users.resetPassword.useMutation();
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!newPassword) {
      setError("Preencha a nova senha!");
      return;
    }
    if (!meQuery.data?.id) {
      setError("Usuário não carregado!");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({ id: meQuery.data.id, password: newPassword });
      setSuccess("Senha alterada com sucesso!");
      setNewPassword("");
    } catch {
      setError("Erro ao alterar senha");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground">Gerencie seus dados pessoais e senha</p>
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl border-none rounded-2xl bg-white/90 backdrop-blur-lg">
            <CardHeader className="flex flex-col items-center gap-2 pb-0">
              <div className="flex flex-col items-center gap-2">
                <div {...getRootProps()} className="relative group cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-100 to-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    {uploading ? (
                      <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                    ) : profileImage ? (
                      <img src={profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : isDragActive ? (
                      <span className="text-slate-400">Solte a imagem aqui...</span>
                    ) : (
                      <span className="text-slate-400">Clique ou arraste para enviar foto</span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">Alterar foto</span>
                  </div>
                </div>
                {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </div>
              <CardTitle className="text-2xl font-bold mt-2">{name}</CardTitle>
              <CardDescription className="text-slate-500">{email}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSaveProfile} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Nome</label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Telefone</label>
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition">Salvar dados</Button>
                {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </form>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">Nova senha</label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl transition" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Trocar senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

