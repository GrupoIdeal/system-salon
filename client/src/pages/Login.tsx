import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { AlertCircle, Loader2 } from "lucide-react";
import { storeAuthToken } from "@/lib/auth-utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const utils = trpc.useUtils();

  // Função para verificar cookies
  const checkCookies = () => {
    console.log("Verificando cookies no cliente:", document.cookie);
  }; const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      console.log("Login bem-sucedido", data);

      // Verificar cookies após login
      checkCookies();

      // Armazenar o token de sessão manualmente
      if (data.sessionToken) {
        console.log("Armazenando token de sessão:", data.sessionToken.substring(0, 10) + "...");
        storeAuthToken(data.sessionToken);

        // Invalidar a consulta auth.me para recarregar os dados do usuário
        await utils.auth.me.invalidate();

        // Aguardar um momento para que a consulta seja recarregada
        setTimeout(() => {
          checkCookies(); // Verificar cookies novamente antes do redirecionamento
          console.log("Redirecionando para o dashboard após login bem-sucedido");
          setLocation("/dashboard");
        }, 1000);
      } else {
        console.error("ERRO: Login bem-sucedido, mas não recebeu token de sessão");
        setError("Erro de autenticação. Tente novamente.");
      }
    },
    onError: (err) => {
      console.error("Erro de login:", err);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            {APP_LOGO && (
              <img src={APP_LOGO} alt="Logo" className="w-16 h-16 rounded-lg" />
            )}
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription>Faça login para acessar o sistema</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="flex justify-end">
              <Link href="/recuperar-senha">
                <Button variant="link" size="sm" className="p-0" type="button">
                  Esqueceu sua senha?
                </Button>
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
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
  );
}

