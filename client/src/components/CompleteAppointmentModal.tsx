import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  Star,
  Copy,
  Check,
} from "lucide-react";
import { PixQRCode } from "@/components/PixQRCode";

interface AppointmentForComplete {
  id: string;
  service?: { id: string; name: string; price: string } | null;
}

// Item de produto adicionado ao checkout
interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number; // preço de venda do produto
  stock: number; // estoque disponível (para validação)
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointment?: AppointmentForComplete | null;
  onSuccess?: () => void;
}

export default function CompleteAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: Props) {
  // Token retornado após concluir — exibe tela de sucesso com link de avaliação
  const [ratingToken, setRatingToken] = useState<string | null>(null);
  // Controla ícone de "copiado" por 2s
  const [copied, setCopied] = useState(false);

  // Valor do serviço (base do total)
  const [serviceAmount, setServiceAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    | "cash"
    | "credit_card"
    | "debit_card"
    | "pix"
    | "bank_transfer"
    | "other"
    | ""
  >("");

  // Produtos adicionados ao checkout
  const [cart, setCart] = useState<CartItem[]>([]);

  // Produto sendo pesquisado para adicionar
  const [productSearch, setProductSearch] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productQty, setProductQty] = useState<number>(1);

  // Busca a lista de produtos do salão
  const productsQuery = trpc.products.list.useQuery(undefined, {
    enabled: isOpen,
  });

  // Busca dados do salão para PIX (chave + nome)
  const salonQuery = trpc.salon.get.useQuery(undefined, { enabled: isOpen });

  // Reset ao abrir o modal
  useEffect(() => {
    if (isOpen && appointment) {
      setServiceAmount(appointment.service?.price ?? "");
      setPaymentMethod("cash");
      setCart([]);
      setProductSearch("");
      setSelectedProductId("");
      setProductQty(1);
      setRatingToken(null);
      setCopied(false);
    }
  }, [isOpen, appointment]);

  // ─── Cálculo do total ──────────────────────────────────────────────────────
  const servicePrice =
    parseFloat(
      (serviceAmount || "0").replace(/[^0-9.,]/g, "").replace(",", ".")
    ) || 0;

  const productsTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const grandTotal = servicePrice + productsTotal;

  // ─── Adicionar produto ao carrinho ─────────────────────────────────────────
  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return;
    }
    if (productQty < 1) {
      toast.error("Quantidade deve ser ao menos 1");
      return;
    }

    const product = productsQuery.data?.find(p => p.id === selectedProductId);
    if (!product) return;

    // Preço de venda do produto
    const unitPrice =
      parseFloat(
        (product.sellPrice ?? "0").replace(/[^0-9.,]/g, "").replace(",", ".")
      ) || 0;

    if (unitPrice <= 0) {
      toast.error("Este produto não tem preço de venda definido");
      return;
    }

    const available = product.stock ?? 0;
    // Verificar se já está no carrinho
    const existingIdx = cart.findIndex(c => c.productId === selectedProductId);
    const alreadyInCart = existingIdx >= 0 ? cart[existingIdx].quantity : 0;
    const totalRequested = alreadyInCart + productQty;

    if (totalRequested > available) {
      toast.error(
        `Estoque insuficiente. Disponível: ${available - alreadyInCart}`
      );
      return;
    }

    if (existingIdx >= 0) {
      // Incrementar quantidade existente
      setCart(prev =>
        prev.map((c, i) =>
          i === existingIdx ? { ...c, quantity: c.quantity + productQty } : c
        )
      );
    } else {
      // Novo item
      setCart(prev => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: productQty,
          unitPrice,
          stock: available,
        },
      ]);
    }

    // Limpar seleção
    setSelectedProductId("");
    setProductQty(1);
    setProductSearch("");
  };

  const handleRemoveProduct = (productId: string) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  };

  // ─── Mutation de conclusão ────────────────────────────────────────────────
  const completeMutation = trpc.appointments.complete.useMutation({
    onSuccess: data => {
      toast.success("Agendamento concluído com sucesso!");
      // Se gerou token de avaliação, mantém modal aberto para o usuário copiar o link
      // onSuccess e onClose são chamados só quando o usuário fechar manualmente
      if ((data as any)?.ratingToken) {
        setRatingToken((data as any).ratingToken);
      } else {
        onSuccess?.();
        onClose();
      }
    },
    onError: err => {
      toast.error(`Erro ao concluir agendamento: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    if (!appointment) return;

    if (grandTotal <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    completeMutation.mutate({
      id: appointment.id,
      paymentMethod: paymentMethod || undefined,
      amountPaid: grandTotal,
      // Enviar os produtos do carrinho para registrar e descontar estoque
      products: cart.map(c => ({
        productId: c.productId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
      })),
    });
  };

  // Filtra produtos pelo texto digitado na busca
  const filteredProducts = (productsQuery.data ?? []).filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // URL do link de avaliação
  const ratingUrl = ratingToken
    ? `${window.location.origin}/avaliar?token=${ratingToken}`
    : null;

  const handleCopyLink = () => {
    if (!ratingUrl) return;
    navigator.clipboard.writeText(ratingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Tela de sucesso com link de avaliação ────────────────────────────────
  if (ratingToken) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Atendimento concluído!
            </DialogTitle>
            <DialogDescription>
              Compartilhe o link abaixo para o cliente avaliar o atendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Estrelas decorativas */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className="h-7 w-7 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* URL do link de avaliação */}
            <div className="bg-muted rounded-md px-3 py-2 text-xs text-muted-foreground break-all">
              {ratingUrl}
            </div>

            {/* Botão copiar */}
            <Button className="w-full" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Link copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copiar link de avaliação
                </>
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Concluir Atendimento
          </DialogTitle>
          <DialogDescription>
            Adicione produtos usados/vendidos, confira o total e registre o
            pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* ── Serviço ─────────────────────────────────────────────────── */}
          <div className="space-y-1">
            <Label>Serviço: {appointment?.service?.name ?? "—"}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Valor (R$):</span>
              <Input
                value={serviceAmount}
                onChange={e => setServiceAmount(e.target.value)}
                placeholder="0.00"
                className="w-32"
              />
            </div>
          </div>
          <Separator />
          {/* ── Adicionar produtos ───────────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Adicionar Produtos
            </Label>

            {/* Busca do produto */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar produto..."
                  value={productSearch}
                  onChange={e => {
                    setProductSearch(e.target.value);
                    setSelectedProductId(""); // limpa seleção ao digitar
                  }}
                  className="w-full"
                />
                {/* Dropdown de sugestões */}
                {productSearch.length > 0 &&
                  filteredProducts.length > 0 &&
                  !selectedProductId && (
                    <div className="absolute z-50 w-full bg-background border rounded shadow-md mt-1 max-h-40 overflow-y-auto">
                      {filteredProducts.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between items-center"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setProductSearch(p.name);
                          }}
                        >
                          <span>{p.name}</span>
                          <span className="text-xs text-muted-foreground">
                            R$ {p.sellPrice ?? "—"} · estoque: {p.stock}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <Input
                type="number"
                min={1}
                value={productQty}
                onChange={e => setProductQty(Number(e.target.value))}
                className="w-20"
                placeholder="Qtd"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddProduct}
                disabled={!selectedProductId}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Carrinho de produtos */}
            {cart.length > 0 && (
              <div className="space-y-2">
                {cart.map(item => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2 border rounded text-sm"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        R$ {(item.unitPrice * item.quantity).toFixed(2)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Separator />
          {/* ── Resumo do total ──────────────────────────────────────────── */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço</span>
              <span>R$ {servicePrice.toFixed(2)}</span>
            </div>
            {cart.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Produtos ({cart.reduce((s, c) => s + c.quantity, 0)} itens)
                </span>
                <span>R$ {productsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total</span>
              <span>R$ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
          {/* ── Método de pagamento ──────────────────────────────────────── */}
          <div>
            <Label>Método de pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v: typeof paymentMethod) => setPaymentMethod(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="bank_transfer">Transferência</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* QR Code PIX — exibido somente quando PIX é selecionado */}
          {paymentMethod === "pix" && (salonQuery.data as any)?.pixKey ? (
            <PixQRCode
              pixKey={(salonQuery.data as any).pixKey}
              amount={grandTotal}
              salonName={salonQuery.data?.name ?? "Salão"}
            />
          ) : paymentMethod === "pix" ? (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-3 py-2">
              ⚠️ Chave PIX não cadastrada. Vá em <strong>Empresa</strong> e
              adicione sua chave PIX.
            </p>
          ) : null}{" "}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={completeMutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={completeMutation.isPending}>
            {completeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirmar Pagamento · R$ {grandTotal.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
