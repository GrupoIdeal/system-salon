/**
 * PhotoUpload — componente reutilizável de upload de foto via câmera ou galeria.
 *
 * Como usar:
 *   <PhotoUpload
 *     currentPhoto={formData.photo}  // URL já salva (opcional)
 *     onUpload={(url) => setFormData(f => ({ ...f, photo: url }))}
 *     label="Foto do cliente"
 *   />
 *
 * Fluxo:
 *   1. Usuário seleciona arquivo (câmera traseira no celular, ou galeria)
 *   2. Arquivo é lido como base64 via FileReader
 *   3. base64 é enviado para `images.upload` → Cloudinary
 *   4. URL retornada pelo Cloudinary é passada via `onUpload(url)`
 */

import { useRef, useState } from "react";
import { Camera, User2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PhotoUploadProps {
  /** URL da foto atual (vinda do banco, ex.: Cloudinary) */
  currentPhoto?: string | null;
  /** Callback chamado com a URL definitiva após upload no Cloudinary */
  onUpload: (url: string) => void;
  /** Texto exibido no botão/rótulo */
  label?: string;
  /** Tamanho do círculo de preview em px (padrão: 144) */
  size?: number;
}

const MAX_FILE_SIZE_MB = 5; // limite de tamanho do arquivo

export function PhotoUpload({
  currentPhoto,
  onUpload,
  label = "Alterar foto",
  size = 144,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mutation que envia o base64 para o servidor → Cloudinary
  // ⚙️ Ponto de troca: se trocar de provedor, alterar apenas `trpc.images.upload`
  const uploadMutation = trpc.images.upload.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`A foto deve ter no máximo ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    // Ler como base64 para preview imediato
    const reader = new FileReader();
    reader.onload = async ev => {
      const base64 = ev.target?.result as string;
      setPreview(base64);

      try {
        setIsUploading(true);
        // Enviar para Cloudinary via tRPC
        const res = await uploadMutation.mutateAsync({ base64 });
        // Passar a URL definitiva para o componente pai
        onUpload(res.url);
        toast.success("Foto atualizada com sucesso!");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao enviar foto";
        toast.error(msg);
        // Reverter preview em caso de erro
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const displayPhoto = preview || currentPhoto;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative group cursor-pointer"
        style={{ width: size, height: size }}
      >
        <label className="block w-full h-full cursor-pointer">
          {/*
           * capture="environment" → abre câmera traseira em dispositivos móveis.
           * No desktop, abre o seletor de arquivo normalmente.
           * ⚙️ Ponto de troca: remova `capture` para sempre abrir galeria.
           */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            aria-label={label}
          />

          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-100 to-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Foto do perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User2
                className="text-slate-400"
                style={{ width: size * 0.44, height: size * 0.44 }}
              />
            )}
          </div>

          {/* Overlay de loading */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}

          {/* Overlay de câmera no hover */}
          {!isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white mb-1" />
              <span className="text-white text-xs font-medium text-center px-2 leading-tight">
                {label}
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
