import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  salonName: string;
  onSuccess?: (transactionId: string) => void;
}

// Componente de checkout Stripe simulado
// Em produção: substituir por Elements + PaymentElement do @stripe/react-stripe-js
export function StripeCheckoutModal({
  isOpen,
  onClose,
  amount,
  salonName,
  onSuccess,
}: StripeCheckoutProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber.trim() || !expiry.trim() || !cvc.trim() || !cardName.trim()) {
      toast.error("Preencha todos os campos do cartão");
      return;
    }

    setProcessing(true);

    // Simular processamento do pagamento via Stripe
    // Em produção: stripe.confirmCardPayment(clientSecret)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockSuccess = Math.random() > 0.1; // 90% chance de sucesso no mock

    if (mockSuccess) {
      setSuccess(true);
      toast.success("Pagamento aprovado!");
      const txnId = `txn_stripe_${Date.now()}`;
      onSuccess?.(txnId);
    } else {
      toast.error("Cartão recusado. Tente outro cartão.");
    }

    setProcessing(false);
  };

  const handleClose = () => {
    if (processing) return;
    setSuccess(false);
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setCardName("");
    onClose();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 justify-center">
              <CheckCircle2 className="h-6 w-6" />
              Pagamento Confirmado!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-3 py-4">
            <div className="text-3xl font-bold text-green-600">
              R$ {amount.toFixed(2).replace(".", ",")}
            </div>
            <p className="text-sm text-muted-foreground">
              Pagamento via Stripe processado com sucesso.
            </p>
            <p className="text-xs text-muted-foreground">
              {salonName} agradece sua preferência!
            </p>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento via Cartão (Stripe)
          </DialogTitle>
          <DialogDescription>
            Pagamento seguro processado via Stripe. Seus dados não são armazenados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <span className="text-sm text-muted-foreground">Total a pagar</span>
            <div className="text-2xl font-bold">
              R$ {amount.toFixed(2).replace(".", ",")}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="card-name">Nome no Cartão</Label>
              <Input
                id="card-name"
                placeholder="Nome como está no cartão"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                disabled={processing}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="card-number">Número do Cartão</Label>
              <Input
                id="card-number"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                disabled={processing}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  disabled={processing}
                  maxLength={5}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  disabled={processing}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Lock className="h-3 w-3" />
            Pagamento processado com segurança via Stripe
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                `Pagar R$ ${amount.toFixed(2).replace(".", ",")}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
