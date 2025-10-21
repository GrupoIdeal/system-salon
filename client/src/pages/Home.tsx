import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleAccess = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-blue-50 to-blue-200">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full">
        <img src="https://placehold.co/120x120/3b82f6/ffffff?text=SB" alt="Logo Salão de Beleza Tal" className="mb-6 rounded-full shadow-lg" />
        <h1 className="text-4xl font-extrabold mb-3 text-pink-600 text-center">Sistema do Salão de Beleza Tal</h1>
        <p className="mb-8 text-gray-700 text-center text-lg">Bem-vindo ao sistema exclusivo para gestão do Salão de Beleza Tal.<br />Acesse para continuar.</p>
        <Button variant="default" size="lg" className="w-full text-lg py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold transition" onClick={handleAccess}>
          Acessar o Sistema
        </Button>
        <div className="mt-8 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} Salão de Beleza Tal. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
