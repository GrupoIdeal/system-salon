# Tópicos Especiais — Docker, PIX e PWA

**Projeto:** Projeto Integrado IV (2026.1)  
**Data:** 15 de junho de 2026

---

## Tópico 1: Docker — Containerização do Sistema

### 1.1 Visão Geral

O BeautySalon Access utiliza **Docker** e **docker-compose** para criar um ambiente de desenvolvimento e produção completamente reprodutível. Toda a stack (aplicação + banco de dados) pode ser iniciada com um único comando.

### 1.2 Arquitetura Docker

```
┌──────────────────────────────────┐
│         docker-compose.yml        │
│                                  │
│  ┌────────────┐  ┌─────────────┐ │
│  │   app       │  │     db       │ │
│  │  (Node.js)  │  │ (PostgreSQL) │ │
│  │  port:3000  │  │  port:5432   │ │
│  └────────────┘  └─────────────┘ │
│        │               │         │
│        └───────┬───────┘         │
│                │                 │
│    network: salon-network        │
│    volume:   pgdata              │
└──────────────────────────────────┘
```

### 1.3 Serviços

| Serviço | Imagem | Porta | Função |
|---------|--------|-------|--------|
| `app` | Build customizado (Dockerfile) | 3000 | Aplicação Node.js + Express |
| `db` | postgres:16 | 5432 | Banco de dados PostgreSQL |

### 1.4 Dockerfile — Build Multi-stage

```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Stage 2: Runtime (imagem final ~200MB)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Vantagens do multi-stage:**
- Imagem final é ~70% menor (apenas runtime, sem dependências de build)
- Camada de build cacheada (pnpm store)
- Alpine Linux como base mínima

### 1.5 Volumes e Persistência

| Volume | Container | Propósito |
|--------|-----------|-----------|
| `pgdata` | db | Persistir dados do PostgreSQL entre reinicializações |
| `backups` | app | Armazenar backups do banco |

### 1.6 Rede

Os containers comunicam-se via rede interna `salon-network`. O app conecta ao banco via hostname `db` (resolução DNS interna do Docker).

---

## Tópico 2: PIX — Pagamentos Instantâneos

### 2.1 Visão Geral

O sistema integra **PIX** como método de pagamento, gerando QR Codes no padrão **EMV®** (Europay, Mastercard, Visa) definido pelo **Banco Central do Brasil**. O QR Code é estático e contém todos os dados necessários para o pagamento.

### 2.2 Funcionamento

```
1. Salão cadastra chave PIX em /empresa
2. Ao concluir atendimento, admin seleciona "PIX" como pagamento
3. Sistema gera payload EMV com:
   - Chave PIX do salão
   - Nome do recebedor
   - Valor da transação
   - Cidade do recebedor
   - Identificador da transação
4. QR Code é renderizado via qrcode.react
5. Cliente escaneia com app do banco
6. Pagamento confirmado → transação registrada
```

### 2.3 Payload EMV (Exemplo)

```
000201                    ← Payload Format Indicator
26360014BR.GOV.BCB.PIX    ← Merchant Account Information (PIX)
0114{CHAVE_PIX}           ← Chave PIX (telefone/CPF/e-mail/aleatória)
520400005303986           ← Merchant Category Code + Currency
5802BR                    ← Country Code
59{NOME}                  ← Merchant Name
60{CIDADE}                ← Merchant City
62070503***               ← Transaction ID
6304{CRC}                 ← Checksum
```

### 2.4 Componente PixQRCode

```tsx
<QRCode value={pixPayload} size={200} level="M" />
```

- Biblioteca: `qrcode.react` (v4.2.0)
- Exibe chave PIX em texto com botão "Copiar"
- Compatível com todos os apps de banco (Nubank, Itaú, Bradesco, PicPay, etc.)

---

## Tópico 3: PWA — Progressive Web App

### 3.1 Visão Geral

O sistema é uma **Progressive Web App (PWA)**, podendo ser instalado como aplicativo nativo em Android, iOS e desktop, **sem necessidade de loja de aplicativos**.

### 3.2 Características PWA

| Característica | Implementação |
|---------------|---------------|
| **Instalável** | Manifesto web com ícones 192px e 512px |
| **Offline** | Service Worker com Workbox, 56 assets pre-cacheados |
| **Splash Screen** | Tela de abertura com cor de fundo `#0f172a` |
| **Standalone** | Abre sem barra de navegação do browser |
| **Auto-update** | Service Worker detecta nova versão e atualiza automaticamente |
| **Notificações** | Web Push API (base implementada) |

### 3.3 Manifesto Web

```json
{
  "name": "Graciosa Studio de Beleza",
  "short_name": "Graciosa Studio",
  "theme_color": "#0f172a",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/"
}
```

### 3.4 Estratégia de Cache

| Tipo de recurso | Estratégia |
|-----------------|-----------|
| Assets estáticos (JS, CSS, fontes) | Precache (instalados no SW) |
| Imagens | Cache First (serve do cache, fallback rede) |
| API (tRPC) | Network First (tenta rede, fallback cache) |
| Páginas HTML | Network First |

### 3.5 Tecnologia

- **Workbox** (Google) — Biblioteca padrão para Service Workers
- **vite-plugin-pwa** — Integração com o build do Vite
- **InjetManifest** — Estratégia de SW customizada em `client/src/sw.ts`

---

*Documento elaborado para o Projeto Integrado IV — 2026.1*
