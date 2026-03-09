import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_LOGO } from "@/const";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { storeAuthToken } from "@/lib/auth-utils";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async data => {
      if (data.sessionToken) {
        storeAuthToken(data.sessionToken);
        await utils.auth.me.invalidate();
        setTimeout(() => {
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
    <div className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 md:px-8 py-6 sm:py-8">
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
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white/90 backdrop-blur-lg z-10 mx-auto">
        {/* Lado esquerdo: Login */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 md:px-10 py-10 sm:py-12 md:py-16">
          <div className="mb-8 text-center">
            {APP_LOGO && (
              <img
                src={APP_LOGO}
                alt="Logo"
                className="mx-auto mb-4 sm:mb-6 w-24 h-24 sm:w-32 sm:h-32 object-contain"
              />
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--primary)] drop-shadow">
              Bem-vindo
            </h1>
            <p className="text-[var(--primary)] mt-2 text-base sm:text-lg">
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
                    className="text-sm font-medium text-[var(--primary)]"
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
                    className="bg-white/80 border-[var(--border)]"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[var(--primary)]"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={loginMutation.isPending}
                      className="bg-white/80 border-[var(--border)] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={loginMutation.isPending}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[var(--primary)] hover:bg-[var(--chart-4)] text-[var(--primary-foreground)] font-bold py-2 rounded-xl shadow-lg"
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
        <div className="hidden md:flex flex-1 h-auto min-h-[600px] items-stretch justify-stretch bg-gradient-to-tr from-[var(--chart-1)] to-[var(--chart-3)] p-0">
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
