// Página de Avaliações recebidas — visão admin
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Star, MessageSquare, Search, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Componente de estrelas somente leitura ──────────────────────────────────
function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <span className="text-amber-400 text-base" aria-label={`${value} estrelas`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < value ? "\u2605" : "\u2606"
      ).join("")}
    </span>
  );
}

// Badge colorido por nota
function RatingBadge({ stars }: { stars: number | null }) {
  if (!stars) return null;
  const color =
    stars >= 4
      ? "bg-green-100 text-green-800"
      : stars === 3
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${color}`}
    >
      <Star className="h-3 w-3" />
      {stars}
    </span>
  );
}

export default function Avaliacoes() {
  const ratingsQuery = trpc.ratings.getAll.useQuery();
  const [search, setSearch] = useState("");

  const rows = ratingsQuery.data ?? [];

  // Filtro por nome de especialista ou cliente
  const filtered = search
    ? rows.filter(
        r =>
          r.specialistName?.toLowerCase().includes(search.toLowerCase()) ||
          r.clientName?.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  // KPIs rápidos
  const total = rows.length;
  const avg =
    total > 0
      ? (rows.reduce((s, r) => s + (r.stars ?? 0), 0) / total).toFixed(1)
      : "—";
  const dist = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: rows.filter(r => r.stars === n).length,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Avaliações
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Feedback dos clientes após cada atendimento
          </p>
        </div>

        {/* ── KPIs resumo ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              {ratingsQuery.isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{total}</div>
                  <p className="text-xs text-muted-foreground">avaliações</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            </CardHeader>
            <CardContent>
              {ratingsQuery.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-amber-500">
                    {avg}
                    {avg !== "—" && (
                      <span className="text-base ml-1">&#9733;</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">de 5 estrelas</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Distribuição resumida */}
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratingsQuery.isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {dist.map(d => (
                    <div
                      key={d.stars}
                      className="flex items-center gap-1 text-sm"
                    >
                      <span className="text-amber-400">
                        {"★".repeat(d.stars)}
                      </span>
                      <Badge variant="secondary">{d.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Tabela de avaliações ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Todas as avaliações
                </CardTitle>
                <CardDescription>
                  Ordenadas da mais recente para a mais antiga
                </CardDescription>
              </div>
              {/* Busca */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar especialista ou cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ratingsQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {search
                    ? "Nenhuma avaliação encontrada para esse filtro"
                    : "Ainda não há avaliações. Compartilhe o link após concluir um atendimento!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(r => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 border rounded-lg"
                  >
                    {/* Lado esquerdo */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <RatingBadge stars={r.stars} />
                        <Stars value={r.stars} />
                      </div>
                      {r.comment && (
                        <p className="text-sm text-foreground italic">
                          "{r.comment}"
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {r.clientName ?? "Cliente anônimo"}
                        </span>
                        <span>·</span>
                        <span>
                          Especialista:{" "}
                          <strong>{r.specialistName ?? "—"}</strong>
                        </span>
                      </div>
                    </div>
                    {/* Data */}
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {r.submittedAt
                        ? format(new Date(r.submittedAt), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
