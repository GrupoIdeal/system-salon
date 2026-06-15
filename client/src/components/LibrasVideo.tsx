import { Hand } from "lucide-react";

interface LibrasVideoProps {
  videoId: string;
  title: string;
  description?: string;
}

export function LibrasVideo({ videoId, title, description }: LibrasVideoProps) {
  const isPlaceholder = videoId.startsWith('PLACEHOLDER');
  
  return (
    <div className="rounded-lg overflow-hidden shadow bg-white border border-gray-200">
      <div className="aspect-video bg-gray-100 relative">
        {isPlaceholder ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <Hand className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Vídeo em Libras</p>
            <p className="text-xs text-gray-400 mt-1">Em breve</p>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Hand className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        </div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}
