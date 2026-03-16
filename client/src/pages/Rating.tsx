/**
 * Página pública de avaliação pós-atendimento.
 * Acessada via /avaliar?token=<uuid>
 *
 * Fluxo:
 *  1. Lê o token da query string
 *  2. Busca a avaliação no servidor via publicTrpc.ratings.getByToken
 *  3. Se já enviada (used = true) → mostra mensagem de agradecimento
 *  4. Caso contrário → exibe formulário com 1-5 estrelas + comentário opcional
 *  5. Submete via publicTrpc.ratings.submit
 */

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { publicTrpc, publicTrpcClient } from "@/lib/public-trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

const queryClient = new QueryClient();

// ────────────────────────────────────────────────────────────────
// Componente de seleção de estrelas
// ────────────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div
      className="flex gap-2 justify-center my-4"
      role="group"
      aria-label="Selecione a nota de 1 a 5 estrelas"
    >
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          className="text-4xl transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          <span
            className={
              (hovered || value) >= n ? "text-amber-400" : "text-gray-300"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Tela principal
// ────────────────────────────────────────────────────────────────
function RatingPage() {
  // Lê o token da query string (?token=xxx)
  const params = new URLSearchParams(globalThis.location?.search ?? "");
  const token = params.get("token") ?? "";

  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Busca os dados do rating pelo token
  const ratingQuery = publicTrpc.ratings.getByToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Mutation para enviar a avaliação
  const submitMutation = publicTrpc.ratings.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: err => {
      toast.error(err.message || "Erro ao enviar avaliação");
    },
  });

  // ── sem token na URL ──
  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto mt-16">
        <CardContent className="text-center py-10">
          <p className="text-destructive font-medium">Link inválido.</p>
          <p className="text-sm text-muted-foreground mt-1">
            O link de avaliação não foi encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── carregando ──
  if (ratingQuery.isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-16">
        <CardContent className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Carregando avaliação...
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── erro ao buscar (token inválido ou expirado) ──
  if (ratingQuery.isError || !ratingQuery.data) {
    return (
      <Card className="w-full max-w-md mx-auto mt-16">
        <CardContent className="text-center py-10">
          <p className="text-2xl mb-2">😕</p>
          <p className="font-medium">Link não encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Este link de avaliação é inválido ou já expirou.
          </p>
        </CardContent>
      </Card>
    );
  }

  const rating = ratingQuery.data;

  // ── já avaliado anteriormente ──
  if (rating.used || submitted) {
    return (
      <Card className="w-full max-w-md mx-auto mt-16">
        <CardContent className="text-center py-10">
          <p className="text-4xl mb-3">🙏</p>
          <p className="text-xl font-semibold">Obrigado pela avaliação!</p>
          <p className="text-sm text-muted-foreground mt-2">
            Sua opinião ajuda a melhorar nossos serviços.
          </p>
          {submitted && stars > 0 && (
            <div className="flex justify-center mt-4 gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  className={`text-2xl ${n <= stars ? "text-amber-400" : "text-gray-200"}`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── formulário de avaliação ──
  return (
    <Card className="w-full max-w-md mx-auto mt-16">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Como foi seu atendimento?</CardTitle>
        {rating.clientName && (
          <p className="text-sm text-muted-foreground">
            Olá, {rating.clientName}!
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de estrelas */}
        <div>
          <p className="text-center text-sm text-muted-foreground">
            Selecione sua nota:
          </p>
          <StarPicker value={stars} onChange={setStars} />
          {stars > 0 && (
            <p className="text-center text-sm font-medium text-amber-600">
              {
                [
                  "",
                  "Ruim 😞",
                  "Regular 😐",
                  "Bom 😊",
                  "Ótimo 😄",
                  "Excelente 🤩",
                ][stars]
              }
            </p>
          )}
        </div>

        {/* Comentário opcional */}
        <div>
          <label
            htmlFor="ratingComment"
            className="text-sm font-medium block mb-1"
          >
            Comentário <span className="text-muted-foreground">(opcional)</span>
          </label>
          <Textarea
            id="ratingComment"
            placeholder="Conte como foi sua experiência..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {comment.length}/500
          </p>
        </div>

        <Button
          className="w-full"
          disabled={stars === 0 || submitMutation.isPending}
          onClick={() =>
            submitMutation.mutate({
              token,
              stars,
              comment: comment.trim() || undefined,
            })
          }
        >
          {submitMutation.isPending ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
// Wrapper com providers
// ────────────────────────────────────────────────────────────────
export default function Rating() {
  return (
    <publicTrpc.Provider client={publicTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-[var(--background)] py-10 px-4">
          <div className="max-w-md mx-auto text-center mb-6">
            {APP_LOGO && (
              <img
                src={APP_LOGO}
                alt="Logo"
                className="h-12 mx-auto mb-2 object-contain"
              />
            )}
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              {APP_TITLE}
            </h1>
          </div>
          <RatingPage />
        </div>
      </QueryClientProvider>
    </publicTrpc.Provider>
  );
}
