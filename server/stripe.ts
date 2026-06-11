import { TRPCError } from "@trpc/server";

// Configuração Stripe
// Em produção: usar @stripe/stripe-js no cliente e stripe no servidor
// Para este projeto, simulamos a integração com Stripe via Payment Intents

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "requires_payment_method" | "processing" | "succeeded" | "failed";
  clientSecret: string;
}

interface CreatePaymentInput {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentMethod?: "pix" | "stripe";
  stripePaymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

// Em produção: substituir pela SDK oficial do Stripe
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Cria um Payment Intent no Stripe
 * Substituir implementação mock pela SDK real em produção
 */
export async function createStripePaymentIntent(
  input: CreatePaymentInput
): Promise<StripePaymentIntent> {
  const amountInCents = Math.round(input.amount * 100);

  // Mock: simular criação de Payment Intent
  if (process.env.NODE_ENV !== "production") {
    console.log("🔷 [Stripe Mock] Criando Payment Intent:", {
      amount: amountInCents,
      currency: input.currency || "brl",
      description: input.description || "Pagamento BizFlow",
    });

    return {
      id: `pi_mock_${Date.now()}`,
      amount: amountInCents,
      currency: input.currency || "brl",
      status: "requires_payment_method",
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
    };
  }

  // Produção: descomentar e usar SDK real
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amountInCents,
  //   currency: input.currency || "brl",
  //   description: input.description,
  //   metadata: input.metadata,
  //   automatic_payment_methods: { enabled: true },
  // });
  // return paymentIntent;

  throw new Error("Stripe não configurado em produção");
}

/**
 * Confirma um pagamento via Stripe
 */
export async function confirmStripePayment(
  paymentIntentId: string
): Promise<PaymentResult> {
  if (process.env.NODE_ENV !== "production") {
    console.log("🔷 [Stripe Mock] Confirmando pagamento:", paymentIntentId);
    return {
      success: true,
      transactionId: `txn_mock_${Date.now()}`,
      paymentMethod: "stripe",
      stripePaymentIntentId: paymentIntentId,
    };
  }

  // const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
  // return { success: paymentIntent.status === "succeeded", ... };

  return { success: false, error: "Stripe não configurado" };
}

/**
 * Gera um checkout híbrido PIX + Stripe
 * Retorna as opções disponíveis para o cliente escolher
 */
export function generatePaymentOptions(
  amount: number,
  pixKey?: string,
  salonName?: string
) {
  const options: Array<{
    method: "pix" | "stripe" | "cash" | "credit_card" | "debit_card";
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      method: "pix",
      label: "PIX",
      icon: "qr-code",
      description: pixKey
        ? "Pague via QR Code PIX"
        : "Chave PIX não cadastrada",
    },
    {
      method: "stripe",
      label: "Cartão (Stripe)",
      icon: "credit-card",
      description: "Pagamento via cartão de crédito ou débito",
    },
    {
      method: "cash",
      label: "Dinheiro",
      icon: "banknote",
      description: "Pague em dinheiro no local",
    },
    {
      method: "credit_card",
      label: "Cartão de Crédito",
      icon: "credit-card",
      description: "Pague com cartão de crédito (maquininha)",
    },
    {
      method: "debit_card",
      label: "Cartão de Débito",
      icon: "credit-card",
      description: "Pague com cartão de débito (maquininha)",
    },
  ];

  return options;
}

export type { PaymentResult, StripePaymentIntent, CreatePaymentInput };
