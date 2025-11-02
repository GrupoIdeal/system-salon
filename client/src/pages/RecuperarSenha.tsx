import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function RecuperarSenha() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [, setLocation] = useLocation();

  const passwordResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError("");
    },
    onError: (err: { message?: string }) => {
      setError(err.message || "Erro ao solicitar recuperação de senha");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email é obrigatório");
      return;
    }

    passwordResetMutation.mutate({ email });
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
            <CardDescription>Recuperação de Senha</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold">Email enviado!</h2>
                <p className="text-center text-muted-foreground">
                  Enviamos um link de recuperação para seu email. Por favor
                  verifique sua caixa de entrada e siga as instruções.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Recuperação de senha"
            >
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Informe o email associado à sua conta para receber um link de
                  recuperação.
                </p>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={passwordResetMutation.isPending}
                  aria-required="true"
                  aria-invalid={!!error}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={passwordResetMutation.isPending || !email}
                aria-busy={passwordResetMutation.isPending}
              >
                {passwordResetMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {passwordResetMutation.isPending
                  ? "Enviando..."
                  : "Recuperar Senha"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
