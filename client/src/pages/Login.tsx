import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_LOGO } from "@/const";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { storeAuthToken } from "@/lib/auth-utils";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const checkCookies = () => {
    console.log("Verificando cookies no cliente:", document.cookie);
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async data => {
      checkCookies();
      if (data.sessionToken) {
        storeAuthToken(data.sessionToken);
        await utils.auth.me.invalidate();
        setTimeout(() => {
          checkCookies();
          setLocation("/dashboard");
        }, 1000);
      } else {
        setError("Erro de autenticação. Tente novamente.");
      }
    },
    onError: err => {
      setError(err.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email e senha são obrigatórios");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Overlay no fundo azul com efeito manchado/borrado */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full bg-black/10 backdrop-blur-2xl"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at 30% 40%, rgba(0,0,0,0.5) 40%, transparent 100%)",
            maskImage:
              "radial-gradient(circle at 30% 40%, rgba(0,0,0,0.5) 40%, transparent 100%)",
          }}
        ></div>
      </div>
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white/90 backdrop-blur-lg z-10">
        {/* Lado esquerdo: Login */}
        <div className="flex-1 flex flex-col justify-center px-10 py-16">
          <div className="mb-8 text-center">
            {APP_LOGO && (
              <img
                src={APP_LOGO}
                alt="Logo"
                className="mx-auto mb-6 w-132 h-32 object-contain"
              />
            )}
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-600 drop-shadow">
              Bem-vindo
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Acesse o sistema com seu usuário e senha
            </p>
          </div>
          <Card className="bg-white/90 border-none shadow-none">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-blue-900"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="bg-white/80 border-blue-300"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-blue-900"
                  >
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="bg-white/80 border-blue-300"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl shadow-lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        {/* Lado direito: Imagem ilustrativa customizada */}
        <div className="hidden md:flex flex-1 h-auto min-h-[600px] items-stretch justify-stretch bg-gradient-to-tr from-blue-100 to-blue-300 p-0">
          <img
            src="/image/img-login.png"
            alt="Login Ilustração"
            className="w-full h-full min-h-[600px] object-cover"
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
