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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AppointmentForComplete {
  id: string;
  service?: { id: string; name: string; price: string } | null;
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
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    | "cash"
    | "credit_card"
    | "debit_card"
    | "pix"
    | "bank_transfer"
    | "other"
    | ""
  >("");

  useEffect(() => {
    if (isOpen && appointment) {
      setAmount(appointment.service?.price ?? "");
      setPaymentMethod("cash");
    }
  }, [isOpen, appointment]);

  const completeMutation = trpc.appointments.complete.useMutation({
    onSuccess: () => {
      toast.success("Agendamento concluído");
      onClose();
      onSuccess?.();
    },
    onError: err => {
      toast.error(`Erro ao concluir agendamento: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    if (!appointment) return;
    const parsed = parseFloat(
      (amount || "")
        .toString()
        .replace(/[^0-9.,]/g, "")
        .replace(",", ".")
    );
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    completeMutation.mutate({
      id: appointment.id,
      paymentMethod: paymentMethod || undefined,
      amountPaid: parsed,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Concluir Agendamento</DialogTitle>
          <DialogDescription>
            Informe o valor pago pelo cliente e o método de pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Valor (R$)</Label>
            <Input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Método de pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v: any) => setPaymentMethod(v)}
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
        </div>

        <DialogFooter>
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
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
