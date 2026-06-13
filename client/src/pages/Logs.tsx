import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

type AuditLogRow = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  salonId?: string | null;
  salonName?: string | null;
  // O servidor retorna Date — exibir via createdAtPretty ou formatando aqui
  createdAt: Date;
  createdAtPretty?: string;
  metadata?: unknown;
  before?: unknown;
  after?: unknown;
};

export default function Logs() {
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  const query = trpc.audit.list.useQuery({ limit, offset });
  const logs = query.data?.logs ?? [];
  const total = query.data?.total ?? undefined;
  const loading = query.isLoading;
  const error = query.error
    ? ((query.error as unknown as { message?: string }).message ??
      "Erro ao buscar logs")
    : null;

  const handlePrev = () => {
    const next = Math.max(0, offset - limit);
    setOffset(next);
  };
  const handleNext = () => {
    const next = offset + limit;
    setOffset(next);
  };

  const copyJSON = async (obj: unknown) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      // silent success
    } catch {
      // ignore
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold">Log do sistema</h1>
          <div className="flex gap-2 items-center">
            <div className="text-sm text-muted">offset: {offset}</div>
            <button
              onClick={() => query.refetch()}
              className="px-3 py-1 rounded bg-[var(--primary)] text-white"
            >
              Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div className="bg-card p-4 rounded text-red-600">{error}</div>
        ) : (
          <div className="bg-card p-4 rounded overflow-x-auto">
            {logs.length === 0 ? (
              <div>Nenhum registro encontrado.</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Usuário</th>
                      <th className="text-left p-2">Ação</th>
                      <th className="text-left p-2">Entidade</th>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Salão</th>
                      <th className="text-left p-2">Metadata</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id} className="border-t align-top">
                        <td className="p-2 align-top">
                          {l.createdAtPretty ??
                            new Date(l.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-2 align-top">
                          {l.userName ?? l.userId ?? "-"}
                        </td>
                        <td className="p-2 align-top">{l.action}</td>
                        <td className="p-2 align-top">{l.entity}</td>
                        <td className="p-2 align-top">{l.entityId ?? "-"}</td>
                        <td className="p-2 align-top">
                          {l.salonName ?? l.salonId ?? "-"}
                        </td>
                        <td className="p-2 align-top">
                          <div className="text-xs whitespace-pre-wrap">
                            {l.metadata
                              ? JSON.stringify(l.metadata).slice(0, 80)
                              : ""}
                          </div>
                        </td>
                        <td className="p-2 align-top">
                          <button
                            onClick={() => setSelected(l)}
                            className="text-xs px-2 py-1 rounded bg-gray-200"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    Mostrando {logs.length} registros
                    {typeof total === "number" ? ` de ${total}` : ""}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrev}
                      className="px-3 py-1 rounded bg-gray-100"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={
                        typeof total === "number"
                          ? offset + limit >= total
                          : logs.length < limit
                      }
                      className="px-3 py-1 rounded bg-gray-100"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de detalhes */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded p-4 max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Detalhes do log</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyJSON(selected)}
                    className="px-2 py-1 text-sm bg-gray-100 rounded"
                  >
                    Copiar JSON
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-2 py-1 text-sm bg-red-100 rounded"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              <div className="text-sm mb-2">ID: {selected.id}</div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted">Usuário</div>
                  <div>{selected.userName ?? selected.userId ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Salão</div>
                  <div>{selected.salonName ?? selected.salonId ?? "-"}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted">Before</div>
                <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                  {JSON.stringify(selected.before ?? {}, null, 2)}
                </pre>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted">After</div>
                <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                  {JSON.stringify(selected.after ?? {}, null, 2)}
                </pre>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted">Metadata</div>
                <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                  {JSON.stringify(selected.metadata ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
