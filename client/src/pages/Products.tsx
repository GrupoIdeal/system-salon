import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Tipo do formulário de produto
type ProductForm = {
  name: string;
  description: string;
  stock: string;
  minStock: string;
  costPrice: string;
  sellPrice: string;
};

// Formulário vazio inicial
const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  stock: "0",
  minStock: "5",
  costPrice: "",
  sellPrice: "",
};

export default function Products() {
  const [search, setSearch] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductForm>(EMPTY_FORM);

  // ---- consultas tRPC ----
  // [TROCA: quando tiver filtro server-side, passar search como input]
  const productsQuery = trpc.products.list.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setFormData(EMPTY_FORM);
      setIsDialogOpen(false);
      toast.success("Produto criado com sucesso");
    },
    onError: err => toast.error(err.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setIsDialogOpen(false);
      toast.success("Produto atualizado com sucesso");
    },
    onError: err => toast.error(err.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setDeleteId(null);
      toast.success("Produto removido");
    },
    onError: err => toast.error(err.message),
  });

  // ---- helpers ----
  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsDialogOpen(true);
  }

  function openEdit(product: NonNullable<typeof productsQuery.data>[0]) {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description ?? "",
      stock: String(product.stock),
      minStock: String(product.minStock),
      costPrice: product.costPrice ?? "",
      sellPrice: product.sellPrice ?? "",
    });
    setIsDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      // coerce para número — validação no servidor também faz isso
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      costPrice: formData.costPrice || null,
      sellPrice: formData.sellPrice || null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  // Filtro local por nome (pesquisa client-side)
  const filtered = (productsQuery.data ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Retorna badge de estoque: vermelho se baixo, verde se ok
  function StockBadge({
    stock,
    minStock,
  }: {
    stock: number;
    minStock: number;
  }) {
    const low = stock <= minStock;
    return (
      <Badge
        variant={low ? "destructive" : "secondary"}
        className="gap-1"
        aria-label={low ? "Estoque baixo" : "Estoque ok"}
      >
        {low && <AlertTriangle className="h-3 w-3" />}
        {stock} un.
      </Badge>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Controle de estoque de produtos do salão
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Busca */}
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
          aria-label="Buscar produtos"
        />

        {/* Lista de produtos */}
        {productsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Package className="h-10 w-10 opacity-30" />
              <p className="text-sm">
                {search
                  ? "Nenhum produto encontrado."
                  : "Nenhum produto cadastrado ainda."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(product => (
              <Card key={product.id} className="relative overflow-hidden">
                {/* Faixa vermelha quando estoque baixo */}
                {product.stock <= product.minStock && (
                  <div
                    className="absolute inset-x-0 top-0 h-1 bg-destructive"
                    aria-hidden="true"
                  />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {product.name}
                    </CardTitle>
                    <StockBadge
                      stock={product.stock}
                      minStock={product.minStock}
                    />
                  </div>
                  {product.description && (
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {/* Preços — exibidos apenas se preenchidos */}
                  {product.sellPrice && (
                    <p>
                      <span className="text-muted-foreground">Venda: </span>
                      <span className="font-medium">
                        {Number(product.sellPrice).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </p>
                  )}
                  {product.costPrice && (
                    <p>
                      <span className="text-muted-foreground">Custo: </span>
                      {Number(product.costPrice).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Estoque mínimo: {product.minStock} un.
                  </p>

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openEdit(product)}
                      aria-label={`Editar ${product.name}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => setDeleteId(product.id)}
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ---- Modal Criar / Editar ---- */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={open => {
          if (!open) setIsDialogOpen(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Altere os dados do produto e clique em Salvar."
                : "Preencha os dados do novo produto."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1">
              <Label htmlFor="product-name">Nome *</Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Shampoo Hidratante"
                required
                minLength={2}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <Label htmlFor="product-desc">Descrição</Label>
              <Textarea
                id="product-desc"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição opcional do produto"
                rows={2}
                maxLength={500}
              />
            </div>

            {/* Estoque atual + mínimo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="product-stock">Estoque atual</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={e =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-min-stock">Estoque mínimo</Label>
                <Input
                  id="product-min-stock"
                  type="number"
                  min={0}
                  value={formData.minStock}
                  onChange={e =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="product-sell">Preço de venda (R$)</Label>
                <Input
                  id="product-sell"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sellPrice}
                  onChange={e =>
                    setFormData({ ...formData, sellPrice: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-cost">Preço de custo (R$)</Label>
                <Input
                  id="product-cost"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={e =>
                    setFormData({ ...formData, costPrice: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---- Confirmação de exclusão ---- */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteId && deleteMutation.mutate({ id: deleteId })
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
