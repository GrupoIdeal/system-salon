/**
 * PixQRCode — exibe QR Code PIX estático para pagamento.
 *
 * Como usar:
 *   <PixQRCode pixKey="11999999999" amount={150.00} salonName="Studio Beleza" />
 *
 * Fluxo:
 *   1. Monta o payload PIX estático (BR Code / EMV) com a chave + valor
 *   2. Renderiza via QRCode da lib qrcode.react
 *   3. Exibe chave PIX em texto para cópia manual
 *
 * ⚙️ Ponto de troca: para PIX dinâmico (com txid rastreável), substituir
 *    gerarPayloadPix() por uma chamada à API do banco.
 */

import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PixQRCodeProps {
  /** Chave PIX do salão (CPF, CNPJ, email, telefone ou aleatória) */
  pixKey: string;
  /** Valor em reais */
  amount: number;
  /** Nome do beneficiário (exibido no app do cliente) */
  salonName: string;
}

// ── Geração do payload PIX estático (BR Code) ─────────────────────────────────
// Referência: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function gerarPayloadPix(pixKey: string, amount: number, nome: string): string {
  const nomeLimitado = nome.slice(0, 25).padEnd(1);
  const valorStr = amount.toFixed(2);

  // Merchant Account Information (MAI) — id 26
  const mai = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", pixKey);

  // Campos obrigatórios
  const payload =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", mai) + // Merchant Account Information
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Transaction Currency (BRL)
    tlv("54", valorStr) + // Transaction Amount
    tlv("58", "BR") + // Country Code
    tlv("59", nomeLimitado) + // Merchant Name
    tlv("60", "SAO PAULO") + // Merchant City
    tlv("62", tlv("05", "***")); // Additional Data (referência)

  // CRC16-CCITT (obrigatório no final)
  const semCrc = payload + "6304";
  const crc = crc16(semCrc).toString(16).toUpperCase().padStart(4, "0");
  return semCrc + crc;
}

function crc16(str: string): number {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xffff;
}
// ──────────────────────────────────────────────────────────────────────────────

export function PixQRCode({ pixKey, amount, salonName }: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);

  const payload = gerarPayloadPix(pixKey, amount, salonName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Não foi possível copiar automaticamente.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <QRCodeSVG value={payload} size={180} level="M" includeMargin={false} />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">Chave PIX</p>
        <p className="text-sm font-mono font-medium break-all max-w-[240px]">
          {pixKey}
        </p>
        <p className="text-base font-bold text-green-600">
          R$ {amount.toFixed(2).replace(".", ",")}
        </p>
      </div>

      {/* Botão copia e cola */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 text-xs px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-colors"
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copiar código PIX
          </>
        )}
      </button>

      <p className="text-[10px] text-muted-foreground text-center max-w-[220px]">
        Escaneie o QR Code ou copie o código no app do seu banco.
      </p>
    </div>
  );
}
