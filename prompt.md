# PROMPT.md — Objetivos de Desenvolvimento — BeautySalon Access

> **Leia este documento inteiro antes de começar.**  
> **Destinatário:** IA assistente de desenvolvimento  
> **Objetivo:** Implementar via código tudo que for possível para o Projeto Integrado IV.  
> **Repositório:** https://github.com/GrupoIdeal/system-salon

---

## Contexto Técnico

### O que é
Sistema de gestão para salões de beleza. **Projeto Integrado IV (2026.1)** — Faculdade CDL.

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + Radix UI + shadcn/ui |
| Backend | Node.js + Express + tRPC |
| Banco | PostgreSQL + Drizzle ORM |
| Mobile | Capacitor (wrapper nativo da SPA) |
| Infra | Docker, PWA (Workbox) |

### Credenciais de teste
```
Email: teste@teste.com
Senha: 123123
```

### Estado atual
- ✅ Backend completo (auth, CRUD, agendamentos, relatórios, dashboard, pagamentos PIX/Stripe)
- ✅ Frontend web funcional no desktop
- ✅ PWA com Service Worker
- ✅ Docker + docker-compose
- ✅ Documentação UML e BPMN em `docs/`
- ⚠️ Mobile: APK gera, login funciona, mas **BottomNav NÃO aparece na tela**
- ❌ Sem funcionalidades nativas (SQLite, push real, câmera, offline)
- ❌ Sem chat, tickets, CRM, PDV/vendas
- ❌ Página Libras existe mas sem vídeos ou vídeo-chamada

---

## OBJETIVOS IMPLEMENTÁVEIS COM CÓDIGO

---

### OBJETIVO 1 (CRÍTICO) — Fazer o App Mobile Funcionar

**Arquivos-chave:** `App.tsx`, `BottomNav.tsx`, `DashboardLayout.tsx`, `index.html`, `index.css`, `capacitor.config.ts`

#### 1.1 Corrigir BottomNav (URGENTE — não aparece no celular)

O componente `client/src/components/BottomNav.tsx` existe e está no bundle de build, mas **não renderiza visivelmente no dispositivo físico**. Já foi tentado: Tailwind fixed, CSS inline, React Portal, remover position:relative do body, remover -webkit-fill-available, remover translateZ(0), div de teste no index.html.

**Abordagens a tentar (da mais simples à mais drástica):**

A) **Alterar viewport meta no `client/index.html`** — tente `height=device-height` no lugar de `viewport-fit=cover`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, height=device-height">
```

B) **Substituir `position: fixed` por layout flexbox** no `DashboardLayout.tsx`. Envolva TODO o conteúdo num container flex column com altura fixa:
```tsx
<div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
  <SidebarInset style={{ flex: 1, overflow: "auto" }}>
    {/* conteúdo existente */}
  </SidebarInset>
  <BottomNav />
</div>
```

C) **Criar o BottomNav como plugin Capacitor nativo** — registrar um plugin que cria uma View nativa Android no rodapé:
- Criar `mobile/android/app/src/main/java/com/salonbooking/app/BottomNavPlugin.java`
- Registrar no `MainActivity.java`
- Isso renderiza a barra FORA do WebView, como componente nativo

D) **Abordagem híbrida** — usar `@capacitor/toast` ou `@capacitor/action-sheet` como fallback: se o BottomNav HTML não aparecer, usar um ActionSheet nativo como navegação.

**Critério de aceitação:** 5 ícones visíveis no rodapé do celular: Início, Agenda, Clientes, Serviços, Produtos.

#### 1.2 Build APK funcional

```bash
cd mobile
rm -rf android/app/build
cd ..
npx cross-env VITE_MOBILE=true VITE_API_URL=http://localhost:3000 npx vite build
cd mobile
npx cap sync
cd android
./gradlew assembleDebug
```

**Critério de aceitação:** APK instala, faz login com teste@teste.com / 123123, BottomNav visível, navegação entre páginas funciona.

---

### OBJETIVO 2 (CRÍTICO) — Funcionalidades Nativas Mobile

#### 2.1 Armazenamento Local (SQLite)

Instalar:
```bash
cd mobile
npm install @capacitor-community/sqlite
npx cap sync
```

Criar `client/src/lib/storage.ts`:
- Inicializar banco SQLite com tabelas espelho (clients, appointments, products)
- Funções `saveOffline()`, `loadOffline()`, `syncWithServer()`
- Fallback para `localStorage` no desktop
- Sincronização: quando online, faz POST dos dados offline para o servidor e limpa

Integrar nas páginas: `Clients.tsx`, `Appointments.tsx`, `Products.tsx` — ao salvar, salva local também.

**Critério de aceitação:** Com modo avião ativado, app ainda mostra dados salvos anteriormente. Ao reconectar, novos registros sobem ao servidor.

#### 2.2 Notificações Push

Instalar:
```bash
cd mobile
npm install @capacitor/push-notifications
npx cap sync
```

Criar `client/src/lib/push.ts`:
- Inicializar push notifications via Capacitor
- Registrar device token no backend
- Escutar eventos `pushNotificationReceived` e mostrar toast no app

Atualizar o backend `server/routers.ts`:
- Endpoint `notifications.registerDevice` para salvar device token
- Endpoint `notifications.sendPush` para enviar push via Firebase

**Nota:** A chave VAPID atual é fake (`BIs_fake_VAPID_PUBLIC_KEY_replace_in_production`). O código deve:
- Ler a chave de `import.meta.env.VITE_VAPID_PUBLIC_KEY`
- Se a chave for fake, mostrar aviso no console mas não quebrar
- Usar `@capacitor/push-notifications` que usa Firebase Cloud Messaging (FCM), não VAPID (Web Push)

**Critério de aceitação:** Ao criar um agendamento, o dispositivo registrado recebe notificação.

#### 2.3 Câmera Nativa

Plugin `@capacitor/camera` já está instalado. Criar `client/src/hooks/useCamera.ts`:
```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativePlatform } from '@/lib/capacitor';

export async function takePhoto(): Promise<string | null> {
  try {
    if (!isNativePlatform()) return null;
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });
    return image.dataUrl;
  } catch {
    return null;
  }
}
```

Criar componente `client/src/components/CameraButton.tsx` que:
- No mobile: abre câmera nativa
- No desktop: fallback para `<input type="file" accept="image/*" capture="environment">`
- Retorna data URL da foto

Integrar em `Clients.tsx` (foto do cliente) e opcionalmente em `Products.tsx` (foto do produto).

**Critério de aceitação:** Botão de câmera abre câmera nativa, foto aparece no formulário.

#### 2.4 Offline-First

Criar `client/src/hooks/useOffline.ts`:
- Detectar online/offline com `@capacitor/network` + eventos `window.addEventListener('online')`
- Fila de operações pendentes salva em localStorage ou SQLite
- Quando volta online, processa fila em ordem

Criar componente `client/src/components/OfflineBanner.tsx`:
- Mostra banner "Você está offline" no topo da tela quando sem conexão
- Esconde quando reconecta

Envolver chamadas tRPC em `client/src/lib/offline-wrapper.ts`:
```typescript
export async function offlineAware<T>(
  onlineFn: () => Promise<T>,
  offlineAction: { type: string; payload: any }
): Promise<T | null> {
  if (navigator.onLine) return onlineFn();
  saveToQueue(offlineAction);
  return null;
}
```

**Critério de aceitação:** Banner offline visível. Ações realizadas offline são sincronizadas ao reconectar.

---

### OBJETIVO 3 — Acessibilidade em Libras (Infraestrutura de Código)

#### 3.1 Player de Vídeos em Libras

Criar `client/src/components/LibrasVideo.tsx`:
```tsx
interface LibrasVideoProps {
  videoId: string;
  title: string;
  description?: string;
}

export function LibrasVideo({ videoId, title, description }: LibrasVideoProps) {
  return (
    <div className="rounded-lg overflow-hidden shadow bg-white">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}
```

Criar `client/src/lib/libras-videos.ts` — catálogo de vídeos (usar placeholders por enquanto, os IDs reais são preenchidos depois que os vídeos forem gravados):
```typescript
export interface LibrasVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: 'tutorial' | 'funcionalidade' | 'acessibilidade';
}

// IDs de placeholder — substituir com IDs reais do YouTube após gravação
export const librasVideos: LibrasVideoItem[] = [
  {
    id: 'login',
    youtubeId: 'PLACEHOLDER_LOGIN',
    title: 'Como fazer login',
    description: 'Tutorial em Libras mostrando como acessar o sistema.',
    category: 'tutorial',
  },
  {
    id: 'dashboard',
    youtubeId: 'PLACEHOLDER_DASHBOARD',
    title: 'Navegando pelo Dashboard',
    description: 'Visão geral das funcionalidades do painel principal.',
    category: 'funcionalidade',
  },
  {
    id: 'agendamento',
    youtubeId: 'PLACEHOLDER_AGENDAMENTO',
    title: 'Como agendar um serviço',
    description: 'Passo a passo para criar e gerenciar agendamentos.',
    category: 'tutorial',
  },
  {
    id: 'cliente',
    youtubeId: 'PLACEHOLDER_CLIENTE',
    title: 'Cadastro de clientes',
    description: 'Como cadastrar e gerenciar clientes no sistema.',
    category: 'tutorial',
  },
  {
    id: 'agenda',
    youtubeId: 'PLACEHOLDER_AGENDA',
    title: 'Gerenciando a agenda',
    description: 'Como visualizar e organizar a agenda de atendimentos.',
    category: 'funcionalidade',
  },
  {
    id: 'acessibilidade',
    youtubeId: 'PLACEHOLDER_ACESSIBILIDADE',
    title: 'Central de acessibilidade',
    description: 'Recursos disponíveis para usuários com deficiência auditiva.',
    category: 'acessibilidade',
  },
];
```

Reconstruir `client/src/pages/AjudaLibras.tsx`:
- Grid responsivo de vídeos com `LibrasVideo`
- Filtro por categoria
- Seção de recursos adicionais (alto contraste, ajuste de fonte)
- Link para vídeo-chamada com intérprete
- Indicador visual de que os vídeos estão em Libras (ícone de mão + legenda)

**Critério de aceitação:** Página `/ajuda-libras` exibe grid com 6 cards de vídeo. Vídeos são carregáveis via iframe do YouTube. Mesmo com placeholders, a estrutura está pronta.

#### 3.2 Vídeo-chamada com Intérprete

Criar `client/src/components/VideoCallButton.tsx`:
```tsx
interface VideoCallButtonProps {
  roomUrl?: string;
  label?: string;
}

export function VideoCallButton({ 
  roomUrl = import.meta.env.VITE_LIBRAS_VIDEO_ROOM || '',
  label = 'Chamar Intérprete em Libras' 
}: VideoCallButtonProps) {
  if (!roomUrl) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        O serviço de intérprete estará disponível em breve. Entre em contato pelo WhatsApp.
      </div>
    );
  }

  return (
    <a
      href={roomUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 10l5 5-5 5" />
        <path d="M4 4v7a4 4 0 004 4h12" />
        <path d="M20 15H8a4 4 0 01-4-4V4" />
      </svg>
      {label}
    </a>
  );
}
```

Usar Daily.co como backend de vídeo (API gratuita). A variável `VITE_LIBRAS_VIDEO_ROOM` deve conter a URL da sala.

**Critério de aceitação:** Botão "Chamar Intérprete" visível na página de ajuda. Se configurado, abre sala de vídeo.

#### 3.3 Navegação por Voz (Web Speech API)

Criar `client/src/hooks/useVoiceNavigation.ts`:
```typescript
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const VOICE_COMMANDS: Record<string, string> = {
  'dashboard': '/dashboard',
  'início': '/dashboard',
  'agenda': '/agendamentos',
  'agendamentos': '/agendamentos',
  'clientes': '/clientes',
  'serviços': '/servicos',
  'produtos': '/produtos',
  'ajuda': '/ajuda-libras',
  'libras': '/ajuda-libras',
  'sair': '/login',
};

export function useVoiceNavigation() {
  const [, setLocation] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(text);
      const route = VOICE_COMMANDS[text];
      if (route) setLocation(route);
    };

    recognition.onend = () => setIsListening(false);

    return () => recognition.abort();

  }, [setLocation]);

  const startListening = () => {
    setIsListening(true);
  };

  return { isListening, startListening, transcript };
}
```

Adicionar botão de microfone no `AccessibilityBar.tsx` ou na página de acessibilidade.

**Critério de aceitação:** Botão de microfone visível. Ao clicar e falar "clientes", navega para /clientes.

---

### OBJETIVO 4 — Módulos do BizFlow Access

#### 4.1 Chat Integrado

**Backend** — adicionar ao `server/routers.ts`:
- Tabela `chat_messages` em `drizzle/schema.ts`: id, senderId, receiverId, content, createdAt, readAt
- Router `chat` com procedures: `send`, `list`, `markAsRead`, `getUnreadCount`

**Frontend** — criar `client/src/pages/Chat.tsx`:
- Lista de conversas à esquerda (clientes que já enviaram mensagem)
- Área de mensagens à direita com bubble chat
- Input de texto + botão enviar
- Polling a cada 3s para novas mensagens (simples, sem WebSocket)
- Badge de mensagens não lidas no menu lateral

**Critério de aceitação:** Admin vê lista de conversas, envia e recebe mensagens. Contador de não lidas no menu.

#### 4.2 Sistema de Tickets

**Backend:**
- Tabela `tickets`: id, clientId, subject, description, status (open/in_progress/resolved/closed), priority, createdAt, updatedAt
- Router `tickets` com procedures: `create`, `list`, `get`, `update`, `changeStatus`

**Frontend** — criar `client/src/pages/Tickets.tsx`:
- Lista de tickets com filtro por status
- Badge colorido por prioridade
- Modal/formulário para criar/editar ticket
- Botão de status (abrir → em andamento → resolvido → fechado)

**Critério de aceitação:** Tickets CRUD completo. Status visual com cores. Filtro funcional.

#### 4.3 Módulo de Vendas (PDV)

**Backend:**
- Tabela `sales`: id, clientId, total, paymentMethod, createdAt
- Tabela `sale_items`: id, saleId, productId, quantity, unitPrice
- Procedure `sales.create` que: registra venda, itens, e decrementa estoque

**Frontend** — criar `client/src/pages/Sales.tsx`:
- Buscar produtos e mostrar em grid de cards (foto, nome, preço)
- Área de "carrinho" (lista de itens + quantidade)
- Campo de busca de cliente
- Total com desconto
- Finalizar venda (modal de confirmação)

**Critério de aceitação:** Seleciona produtos, adiciona ao carrinho, finaliza venda. Estoque decrementa. Venda aparece no histórico.

#### 4.4 Alertas Inteligentes no Dashboard

Criar `client/src/components/SmartAlerts.tsx`:
- Buscar dados de: produtos com estoque baixo, faturamento do mês vs meta, agendamentos do dia
- Exibir cards de alerta com ícones e cores (🟢 normal, 🟡 atenção, 🔴 crítico)

Adicionar queries ao `server/routers.ts` no router `dashboard`:
- `getAlerts()` — retorna lista de alertas com severidade

**Critério de aceitação:** Dashboard mostra alertas visuais de estoque, meta e agenda.

---

### OBJETIVO 5 — Documentação Gerada por Código

#### 5.1 Documento de Arquitetura

Criar `docs/03-uml/arquitetura-sistema.md` com:
- Diagrama de deploy (ASCII art ou mermaid)
- Fluxo de dados (cliente → tRPC → PostgreSQL)
- Estrutura de pastas explicada
- Decisões técnicas (por que tRPC, por que Capacitor, etc.)

#### 5.2 Requisitos Funcionais e Não-Funcionais

Criar `docs/02-requisitos/`:
- `requisitos-funcionais.md`: Lista numerada de RFs (RF01 a RF30) cobrindo todas as funcionalidades implementadas
- `requisitos-nao-funcionais.md`: RNFs de segurança, performance, acessibilidade, usabilidade

#### 5.3 Documentação dos Tópicos Especiais

Criar `docs/06-topicos-especiais/`:
- `docker.md`: containerização, docker-compose.yml, redes, volumes
- `pagamentos.md`: PIX QR Code, Stripe, fluxo de pagamento

#### 5.4 Revisar Documentação de Processos

Revisar e atualizar `docs/DIAGRAMAS_BPMN.md` e `docs/DIAGRAMAS_UML.md` para refletir o sistema atual.

---

### OBJETIVO 6 (BÔNUS) — Melhorias de Código

#### 6.1 Chatbot com IA

Integrar API da OpenAI (ou Groq, gratuita) para responder dúvidas sobre serviços:
- Criar endpoint `chatbot.ask` que envia prompt para API de IA com contexto dos serviços do salão
- Criar componente `ChatbotWidget.tsx` (flutuante no canto)

#### 6.2 Modo Escuro

O tema já existe parcialmente (ThemeContext). Completar:
- Garantir que todas as páginas respeitam o tema dark
- Adicionar toggle no AccessibilityBar
- Salvar preferência no localStorage

#### 6.3 Página de Configurações de Acessibilidade

Criar `client/src/pages/Acessibilidade.tsx`:
- Ajuste de tamanho de fonte (pequeno/médio/grande)
- Toggle alto contraste
- Toggle redução de animações
- Toggle navegação por voz
- Salvar preferências no localStorage

---

## Ordem de Execução Recomendada

```
FASE 1 (maior impacto na nota):
  → Objetivo 1 (BottomNav + APK funcional)
  → Objetivo 2 (SQLite, push, câmera, offline)

FASE 2 (nota complementar):
  → Objetivo 3 (Libras: player, vídeo-chamada, voz)
  → Objetivo 4 (Chat, tickets, vendas, alertas)

FASE 3 (documentação + bônus):
  → Objetivo 5 (documentação)
  → Objetivo 6 (bônus: IA, dark mode, acessibilidade)
```

---

## Arquivos-Chave do Projeto

```
client/src/
├── App.tsx                         # Raiz — BottomNav renderizado aqui
├── components/
│   ├── BottomNav.tsx               # Barra inferior (BROKEN no mobile)
│   ├── DashboardLayout.tsx         # Layout principal com sidebar
│   └── AccessibilityBar.tsx        # Barra de acessibilidade
├── pages/
│   ├── Dashboard.tsx               # Dashboard
│   ├── Appointments.tsx            # Agendamentos
│   ├── Clients.tsx                 # Clientes
│   ├── Services.tsx                # Serviços
│   ├── Products.tsx                # Produtos/estoque
│   ├── Sales.tsx                   # (CRIAR) Vendas/PDV
│   ├── Chat.tsx                    # (CRIAR) Chat
│   ├── Tickets.tsx                 # (CRIAR) Tickets
│   ├── AjudaLibras.tsx             # Central Libras (atualizar)
│   ├── Acessibilidade.tsx          # (CRIAR) Configs acessibilidade
│   └── PublicBooking.tsx           # Agendamento público
├── hooks/
│   ├── useAuth.ts                  # Autenticação
│   ├── useCamera.ts                # (CRIAR) Câmera nativa
│   ├── useOffline.ts               # (CRIAR) Offline-first
│   └── useVoiceNavigation.ts       # (CRIAR) Navegação por voz
└── lib/
    ├── capacitor.ts                # Helpers Capacitor (já existe)
    ├── storage.ts                  # (CRIAR) SQLite/localStorage
    ├── push.ts                     # (CRIAR) Push notifications
    └── libras-videos.ts            # (CRIAR) Catálogo de vídeos

server/
├── _core/index.ts                  # Express + CORS
├── routers.ts                      # TODOS os routers (adicionar chat, tickets, sales)
└── schema.ts                       # Schema Drizzle (adicionar novas tabelas)

mobile/
├── capacitor.config.ts             # Config Capacitor
├── run-android.cmd                 # Script build/deploy
└── android/                        # Projeto Android

docs/                               # Documentação (atualizar/criar)
```

---

## Comandos Úteis

```bash
# Desenvolvimento
NODE_ENV=development pnpm dev

# Build mobile
npx cross-env VITE_MOBILE=true VITE_API_URL=http://localhost:3000 npx vite build
cd mobile && npx cap sync

# Build APK
cd mobile/android && ./gradlew assembleDebug

# Banco de dados
pnpm db:push
NODE_ENV=development pnpm tsx drizzle/seed-admin.ts

# ADB
adb devices
adb -s <ID> reverse tcp:3000 tcp:3000
adb -s <ID> install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Tarefas Manuais (NÃO implementáveis por código)

Estas tarefas dependem de ações humanas e devem ser feitas pelo grupo paralelamente ao desenvolvimento:

1. **Gravar vídeos em Libras** — encontrar intérprete, gravar 6 vídeos de 2-3 min, subir no YouTube
2. **Criar protótipos no Figma** — 5 telas principais (Login, Dashboard, Agendamentos, Cliente, Libras)
3. **Testes com usuários surdos** — contatar 2-3 pessoas, coletar feedback, documentar
4. **Preparar slides da apresentação** — PowerPoint/Google Slides
5. **Criar projeto Firebase** — para push notifications (google-services.json)
6. **Criar conta Daily.co** — para vídeo-chamada (VITE_LIBRAS_VIDEO_ROOM)
7. **Preencher IDs dos vídeos** — após upload no YouTube, atualizar `libras-videos.ts`

---

**Última atualização:** 14/06/2026
