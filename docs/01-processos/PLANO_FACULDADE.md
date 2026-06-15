# BeautySalon Access — Plano de Projeto para o Trabalho da Faculdade

**Disciplina:** Projeto Integrado IV (2026.1)  
**Projeto:** BeautySalon Access — Sistema de Gestão para Salão de Beleza  
**Período:** 16 semanas | 8 Sprints quinzenais  
**Grupo:** 5 integrantes  

---

## Sumário

1. [Situação Atual do Projeto](#1-situação-atual-do-projeto)
2. [Papéis do Grupo de 5 Integrantes](#2-papéis-do-grupo-de-5-integrantes)
3. [O que já está PRONTO](#3-o-que-já-está-pronto)
4. [O que precisa ser CRIADO ou IMPLEMENTADO](#4-o-que-precisa-ser-criado-ou-implementado)
5. [Roadmap Detalhado por Sprint](#5-roadmap-detalhado-por-sprint)
6. [Mapeamento por Disciplina](#6-mapeamento-por-disciplina)
7. [Artefatos a Entregar](#7-artefatos-a-entregar)
8. [Decisões de Arquitetura](#8-decisões-de-arquitetura)

---

## 1. Situação Atual do Projeto

O **System Salon** já existe como uma aplicação web completa, funcional e em produção. Isso é uma **vantagem enorme** em relação a grupos que começam do zero.

### O que o projeto já é

| Característica | Status |
|---------------|--------|
| Aplicação Web Progressive (PWA) | ✅ Implementado |
| Instalável como app no celular (Android + iOS) | ✅ Funcionando |
| Sistema de Gestão completo (admin) | ✅ Implementado |
| Agendamento público (sem login) | ✅ Implementado |
| Backend com API própria (tRPC + Node.js) | ✅ Implementado |
| Banco de dados PostgreSQL | ✅ Implementado |
| Deploy via Docker | ✅ Implementado |

### Por que o PWA atende como "Mobile"

O requisito da disciplina pede um aplicativo para dispositivos móveis. O BeautySalon Access:

- É **instalável como app nativo** em Android e iOS (PWA)
- Funciona **offline** com Service Worker (já implementado)
- Usa a **câmera** do dispositivo via APIs web
- Recebe **notificações push** (base já implementada)
- Layout **responsivo** e adaptado para telas pequenas

> **Justificativa técnica para a banca:** PWAs são reconhecidas pela Google, Apple e W3C como a evolução dos aplicativos móveis. Grandes apps como Twitter Lite, Pinterest, Starbucks e Uber usam esta tecnologia. A escolha elimina a necessidade de duplicar o desenvolvimento para iOS e Android separadamente.

---

## 2. Papéis do Grupo de 5 Integrantes

| # | Papel | Responsabilidades no Projeto |
|---|-------|------------------------------|
| 1 | **Scrum Master / Analista de Processos** | Gerenciar sprints, criar diagramas BPMN, SWOT, documentar processos do salão |
| 2 | **Desenvolvedor Mobile 1 (Front-end)** | Interface do cliente, módulo de fidelidade, avaliações, acessibilidade visual |
| 3 | **Desenvolvedor Mobile 2 (Back-end / API)** | Novas procedures tRPC, banco de dados, integração PIX, notificações push reais |
| 4 | **Especialista em Acessibilidade / Libras** | Gravar/integrar vídeos em Libras, alto contraste, testes com comunidade surda |
| 5 | **Arquiteto de Sistemas / Inovação** | Diagramas UML, documento de arquitetura, Tópico Especial (IA ou PIX) |

---

## 3. O que já está PRONTO

Tudo abaixo já está implementado e funcionando no projeto. Estes itens devem ser **apresentados e documentados**, não refeitos.

### Módulo de Gestão do Salão ✅

- [x] Cadastro completo de clientes (nome, e-mail, telefone, observações, histórico)
- [x] Cadastro de serviços (nome, descrição, duração, preço, "a partir de")
- [x] Cadastro de profissionais/especialistas (foto, bio, especialidade)
- [x] Configuração de horários de trabalho por dia da semana (com intervalo de almoço)
- [x] Controle de usuários do sistema (admin + permissões granulares)

### Módulo de Agendamento ✅

- [x] Calendário visual de horários disponíveis
- [x] Agendamento com escolha de serviço + profissional + horário
- [x] Lógica inteligente de slots (considera duração, buffer, intervalo e existentes)
- [x] Confirmação, conclusão e cancelamento de agendamentos
- [x] Histórico completo de agendamentos
- [x] Agendamento público (cliente agenda sem precisar de login)
- [x] Base de notificações automáticas (24h antes / 2h antes)

### Módulo Analítico ✅

- [x] Dashboard com KPIs (receita mensal, agendamentos hoje, clientes novos)
- [x] Gráfico de receita dos últimos 30 dias
- [x] Comparativo mês atual vs mês anterior
- [x] Relatório de performance por especialista
- [x] Relatório de serviços mais realizados
- [x] Análise de clientes (risco de abandono/churn)
- [x] Exportação de relatórios para CSV

### Infraestrutura ✅

- [x] Autenticação segura (JWT + cookie httpOnly)
- [x] Hash de senhas com bcrypt
- [x] Controle de acesso por papel (admin / user)
- [x] Trilha de auditoria completa (quem fez o quê, quando)
- [x] Rate limiting e headers de segurança (Helmet)
- [x] Proteção contra XSS (sanitização de entradas)
- [x] Deploy com Docker + docker-compose

---

## 4. O que precisa ser CRIADO ou IMPLEMENTADO

Estes são os itens que **ainda não existem** no projeto. Cada item indica em qual sprint deve ser trabalhado.

### Módulo de Acessibilidade (NOVO — Sprint 5 e 6)

- [ ] **Alto contraste:** Toggle de modo alto contraste (além do dark mode atual)
- [ ] **Fonte aumentável:** Botões +A / -A para ajustar tamanho de texto
- [ ] **Vídeos em Libras:** Player de vídeo em Libras nas telas principais (agendamento, cadastro, dashboard)
- [ ] **Ícones descritivos:** Melhorar labels ARIA e navegação por teclado
- [ ] **Suporte de emergência:** Botão "Falar com intérprete" (pode ser link WhatsApp do intérprete parceiro)

### Módulo de Produtos (NOVO — Sprint 3)

- [ ] **Cadastro de produtos:** Nome, quantidade em estoque, preço de custo, preço de venda
- [ ] **Alerta de estoque baixo:** Notificação quando produto abaixo do mínimo configurado
- [ ] **Controle de consumo:** Vincular produtos usados em cada atendimento

### Módulo de Fidelidade / Pontos (NOVO — Sprint 5)

- [ ] **Acúmulo de pontos:** Cada serviço concluído gera X pontos para o cliente
- [ ] **Resgate de pontos:** Pontos podem ser trocados por desconto em serviços
- [ ] **Tela do cliente:** Exibir saldo de pontos no histórico do cliente

### Módulo de Avaliação (NOVO — Sprint 6)

- [ ] **Avaliação pós-serviço:** Após conclusão, enviar link para cliente avaliar (1-5 estrelas + comentário)
- [ ] **Média de avaliações:** Exibir nota média por especialista
- [ ] **Página pública:** Exibir avaliações na tela de agendamento público

### Tópico Especial — PIX Integrado (NOVO — Sprint 5)

- [ ] **Geração de QR Code PIX:** Ao concluir atendimento, gerar QR PIX com valor correto
- [ ] **Chave PIX configurável:** No painel do salão, cadastrar chave PIX
- [ ] **Registro de pagamento:** Marcar como pago ao confirmar recebimento

> **Alternativa:** Chatbot com IA para agendamento automático (via WhatsApp ou dentro do app)

### Documentação / Artefatos Acadêmicos (NÃO É CÓDIGO — múltiplos sprints)

- [ ] **BPMN — Fluxo de agendamento** (Sprint 1)
- [ ] **BPMN — Fluxo de atendimento** (Sprint 1)
- [ ] **BPMN — Fluxo de venda de produtos** (Sprint 1)
- [ ] **Matriz SWOT do salão** (Sprint 1)
- [ ] **UML — Diagrama de Casos de Uso** (Sprint 2)
- [ ] **UML — Diagrama de Classes** (Sprint 2)
- [ ] **UML — Diagramas de Sequência** (Sprint 3): cenários de agendamento e cancelamento
- [ ] **UML — Diagrama de Atividades** (Sprint 8): fluxo completo do usuário
- [ ] **Documento de Requisitos** (Sprint 2): RF + RNF
- [ ] **Documento de Arquitetura** (Sprint 3)
- [ ] **Relatório de Acessibilidade** (Sprint 7): resultados dos testes com surdos
- [ ] **Apresentação Final** (Sprint 8): slides + demo ao vivo

---

## 5. Roadmap Detalhado por Sprint

---

### FASE 1: FUNDAÇÃO E ANÁLISE

---

#### Sprint 1 — Semanas 1-2

**Objetivo:** Modelar os processos do salão e estruturar o projeto.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Definir papéis, criar repositório e padronizar o projeto | Scrum Master | README atualizado, estrutura de branches |
| Mapear fluxo de agendamento (presencial vs. app) | Scrum Master | BPMN_Agendamento.pdf |
| Mapear fluxo de atendimento (chegada → serviço → pagamento) | Scrum Master | BPMN_Atendimento.pdf |
| Mapear fluxo de venda de produtos (exibição → venda → estoque) | Scrum Master | BPMN_Produtos.pdf |
| Elaborar Matriz SWOT do salão real parceiro | Scrum Master | SWOT.pdf / slide |
| Criar protótipo no Figma: telas para o cliente final (app do cliente) | Dev Mobile 1 | Link Figma |
| Configurar ambiente local (Node, pnpm, PostgreSQL via Docker) | Dev Mobile 2 | Documentar setup em README |
| Primeiro contato com instituição para voluntários surdos | Especialista Libras | E-mail / ata de reunião |

**Ferramenta para BPMN:** [draw.io](https://draw.io) — gratuito, exporta PDF e PNG.

---

#### Sprint 2 — Semanas 3-4

**Objetivo:** Especificar requisitos, modelar os diagramas UML e validar a ideia.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Documento de Requisitos (RF01-RF30 + RNF01-RNF10) | Arquiteto | Requisitos.md |
| UML — Diagrama de Casos de Uso (todos os atores e casos) | Arquiteto | UC_Diagram.png |
| UML — Diagrama de Classes (todas as 10 entidades do banco) | Arquiteto | Class_Diagram.png |
| Proposta de melhoria: documentar como o app reduz faltas e melhora gestão | Scrum Master | Proposta_Melhoria.md |
| Protótipos de alta fidelidade no Figma (fluxo completo cliente) | Dev Mobile 1 | Link Figma atualizado |
| Preparação do Checkpoint: Pitch do Projeto | Todos | Apresentação Pitch (10 slides) |

> **Checkpoint 1:** Pitch do Projeto — apresentar a ideia, processos BPMN e protótipos.

**Requisitos Funcionais sugeridos (parcial):**

| Código | Descrição |
|--------|-----------|
| RF01 | O sistema deve permitir que clientes realizem agendamentos sem criar conta |
| RF02 | O sistema deve exibir apenas horários disponíveis para o serviço e profissional escolhidos |
| RF03 | O sistema deve enviar notificação de lembrete 24h e 2h antes do agendamento |
| RF04 | O sistema deve registrar automaticamente a receita ao concluir um atendimento |
| RF05 | O sistema deve exibir vídeos explicativos em Libras para usuários com deficiência auditiva |
| RF06 | O sistema deve permitir pagamento via PIX com geração de QR Code |
| RF07 | O sistema deve alertar quando o estoque de algum produto estiver abaixo do mínimo |
| RF08 | O sistema deve calcular e exibir o saldo de pontos de fidelidade de cada cliente |
| RF09 | O sistema deve exibir um dashboard com métricas de faturamento e agendamentos |
| RF10 | O sistema deve registrar toda ação do usuário em uma trilha de auditoria |

**Requisitos Não-Funcionais:**

| Código | Descrição |
|--------|-----------|
| RNF01 | A interface deve ser responsiva e compatível com smartphones (Android e iOS) |
| RNF02 | O app deve ser instalável via PWA sem necessidade de loja de aplicativos |
| RNF03 | Senhas devem ser armazenadas com hash bcrypt (10 rounds) |
| RNF04 | A API deve responder em menos de 500ms para 95% das requisições |
| RNF05 | O app deve funcionar offline para consulta de agendamentos já carregados |
| RNF06 | Todas as telas devem ter suporte a leitor de tela (ARIA) e contraste mínimo WCAG 2.1 AA |

---

### FASE 2: DESENVOLVIMENTO DO CORE

---

#### Sprint 3 — Semanas 5-6

**Objetivo:** Módulo de Produtos + documento de arquitetura + diagramas de sequência.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Documento de Arquitetura: descrever camadas, padrões, decisões técnicas | Arquiteto | Arquitetura.md (já existe base na DOCUMENTACAO.md) |
| UML — Diagramas de Sequência: agendamento e cancelamento | Arquiteto | Sequence_Agendamento.png / Sequence_Cancelamento.png |
| Criar Módulo de Produtos: tabela `products` no banco + CRUD API | Dev Mobile 2 | Migration SQL + procedures tRPC |
| Criar página de Produtos no frontend (listagem, cadastro, edição) | Dev Mobile 1 | `client/src/pages/Products.tsx` |
| Implementar alerta de estoque baixo (notificação no dashboard) | Dev Mobile 2 | Badge/indicador no dashboard |
| Criar migration: adicionar coluna `loyaltyPoints` na tabela `clients` | Dev Mobile 2 | Migration SQL |

**Nova tabela de banco necessária:**

```sql
-- products
CREATE TABLE products (
  id        VARCHAR(64) PRIMARY KEY,
  salon_id  VARCHAR(64) REFERENCES salons(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  stock     INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,  -- alerta abaixo deste valor
  cost_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Sprint 4 — Semanas 7-8

**Objetivo:** Finalizar protótipos, integrar câmera e geolocalização.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Câmera: implementar upload de foto do cliente no cadastro via câmera do celular | Dev Mobile 1 | Input type="file" capture + preview |
| Câmera: permitir foto "antes e depois" no perfil do especialista | Dev Mobile 1 | Componente `PhotoUpload.tsx` |
| Geolocalização: mapa com localização do salão na tela de agendamento público | Dev Mobile 1 | Embed Google Maps / OpenStreetMap |
| Calcular distância: "você está X km do salão" | Dev Mobile 2 | Função com Haversine formula |
| Protótipos de alta fidelidade finalizados (acessibilidade visual) | Dev Mobile 1 | Link Figma final |
| Garantir modo offline: cachear lista de agendamentos no Service Worker | Dev Mobile 2 | Atualizar `client/src/sw.ts` |

> **Checkpoint 2:** Protótipo Funcional — app com navegação, cadastros, câmera e mapa.

**Como integrar câmera (sem libs externas):**

```tsx
// Em qualquer formulário — já funciona em mobile via PWA
<input
  type="file"
  accept="image/*"
  capture="environment"  // abre câmera traseira
  onChange={handlePhotoChange}
/>
```

---

### FASE 3: ACESSIBILIDADE E INOVAÇÃO

---

#### Sprint 5 — Semanas 9-10

**Objetivo:** Módulo de Acessibilidade + Tópico Especial (PIX).

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Toggle de alto contraste nas configurações do usuário | Dev Mobile 1 | Botão + classe CSS `high-contrast` |
| Botões de ajuste de fonte (+A / -A) | Dev Mobile 1 | localStorage + `font-size` no root |
| Gravar e editar vídeos explicativos em Libras (3 vídeos mínimo) | Especialista Libras | Vídeos hospedados no YouTube/Cloudinary |
| Integrar player de vídeo Libras na tela de agendamento público | Especialista Libras + Dev Mobile 1 | Componente `LibrasHelper.tsx` |
| Melhorar atributos ARIA em todos os formulários | Especialista Libras | PR com `aria-label`, `aria-describedby` |
| PIX: adicionar campo "Chave PIX" nas configurações do salão | Dev Mobile 2 | Migration + campo em `salons` |
| PIX: gerar QR Code estatico no modal de conclusão de atendimento | Dev Mobile 2 | Lib `qrcode.react` + valor formatado |
| Criar Módulo de Pontos de Fidelidade: acúmulo ao concluir agendamento | Dev Mobile 2 | Procedure `appointments.complete` atualizada |

**Exemplo de implementação do QR Code PIX:**

```bash
pnpm add qrcode.react
```

```tsx
import QRCode from 'qrcode.react';

// Chave PIX estática (formato EMV)
const pixPayload = `00020126360014BR.GOV.BCB.PIX0114${chavePix}5204000053039865802BR5913${nomeRecebedor}6009SAO PAULO62070503***63041D3D`;

<QRCode value={pixPayload} size={200} />
```

---

#### Sprint 6 — Semanas 11-12

**Objetivo:** Notificações push reais + Offline-first + Módulo de Avaliações.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Notificações push reais via Web Push API | Dev Mobile 2 | Service Worker atualizado + tabela `push_subscriptions` |
| Lembrete automático 24h e 2h antes (cron job no servidor) | Dev Mobile 2 | `node-cron` ou `setTimeout` server-side |
| Offline-first: cachear agendamentos do dia no IndexedDB | Dev Mobile 2 | Estratégia "cache first" no SW |
| Módulo de Avaliação: tabela `ratings` no banco | Dev Mobile 2 | Migration + procedures tRPC |
| Tela de avaliação pós-serviço (link enviado ao cliente) | Dev Mobile 1 | Página `/avaliar?token=xxx` |
| Exibir média de avaliações por especialista | Dev Mobile 1 | Star rating na página de especialistas |
| Relatório de acessibilidade: documentar implementações | Especialista Libras | Relatorio_Acessibilidade.md |
| Preparação para Checkpoint Beta | Todos | APK/PWA instalável + lista de issues |

> **Checkpoint 3:** Versão Beta — app completo em teste interno.

**Nova tabela necessária:**

```sql
-- ratings
CREATE TABLE ratings (
  id              VARCHAR(64) PRIMARY KEY,
  appointment_id  VARCHAR(64) REFERENCES appointments(id),
  specialist_id   VARCHAR(64) REFERENCES specialists(id),
  client_name     TEXT,
  stars           INTEGER CHECK (stars BETWEEN 1 AND 5),
  comment         TEXT,
  token           VARCHAR(128) UNIQUE,  -- token de uso único enviado ao cliente
  used            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

### FASE 4: TESTES E FINALIZAÇÃO

---

#### Sprint 7 — Semanas 13-14

**Objetivo:** Testes com a comunidade surda + correções + módulo analítico completo.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Sessões de teste com voluntários surdos (mínimo 5 pessoas) | Especialista Libras | Formulário de feedback + fotos/vídeos |
| Corrigir problemas de usabilidade apontados nos testes | Dev Mobile 1 | Lista de fixes no GitHub Issues |
| Finalizar dashboard com gráficos de estoque e avaliações | Dev Mobile 1 | Cards de estoque baixo + rating médio |
| UML — Diagrama de Atividades: fluxo completo do usuário cliente | Arquiteto | Activity_Diagram.png |
| Gravar vídeos de demonstração das funcionalidades com Libras | Especialista Libras | Vídeos no YouTube (unlisted) |
| Testes de segurança: tentar SQL injection, XSS, CSRF | Arquiteto | Relatório de Segurança |

**Formulário de teste de usabilidade (para os voluntários surdos):**

| # | Tarefa | Conseguiu? | Dificuldade (1-5) | Comentário |
|---|--------|-----------|-------------------|------------|
| 1 | Agendar um serviço de corte | Sim / Não | | |
| 2 | Ver seus agendamentos futuros | Sim / Não | | |
| 3 | Usar os vídeos em Libras para navegar | Sim / Não | | |
| 4 | Ativar o modo alto contraste | Sim / Não | | |
| 5 | Avaliar um serviço realizado | Sim / Não | | |

---

#### Sprint 8 — Semanas 15-16

**Objetivo:** Documentação final + APK + Apresentação.

| Tarefa | Responsável | Entregável |
|--------|------------|------------|
| Consolidar toda a documentação final | Scrum Master | Pasta `docs/` completa |
| UML revisado (todos os diagramas atualizados) | Arquiteto | Diagramas atualizados |
| BPMN revisado com o estado final ("AS-IS" vs "TO-BE") | Scrum Master | BPMNs atualizados |
| Gerar build de produção e instalar como PWA (demo ao vivo) | Dev Mobile 2 | URL de produção acessível |
| Montar APK via PWABuilder ou Bubblewrap | Dev Mobile 2 | APK instalável (.apk) |
| Preparar apresentação final (máx. 15 slides) | Todos | Slides + script de demo |
| Ensaio da apresentação | Todos | Gravação do ensaio |

> **Checkpoint Final:** Entrega e Apresentação para a Banca Avaliadora.

**Como gerar o APK a partir do PWA:**

```bash
# Opção 1: PWABuilder (sem código)
# Acessar https://www.pwabuilder.com e inserir a URL do app em produção

# Opção 2: Bubblewrap (Google)
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://suaurl.com/manifest.json
bubblewrap build
```

---

## 6. Mapeamento por Disciplina

| Disciplina | Responsável | Sprints | Entregas (neste projeto) |
|-----------|------------|---------|--------------------------|
| **Diagnóstico e Gestão de Processos** | Scrum Master | 1, 2, 8 | BPMN dos 3 fluxos, Matriz SWOT, Proposta de Melhoria, BPMN AS-IS vs TO-BE |
| **Programação para Dispositivos Móveis** | Devs Mobile 1 e 2 | 3–8 | Módulos novos (Produtos, Pontos, Avaliações, PIX, Acessibilidade), PWA instalável, build final |
| **Análise e Projeto de Sistemas** | Arquiteto | 2, 3, 8 | UML (Casos de Uso, Classes, Sequência, Atividades), Documento de Requisitos, Documento de Arquitetura |
| **Tópicos Especiais** | Arquiteto + Dev Mobile 2 | 5, 6 | Integração PIX com QR Code (ou Chatbot IA) |
| **Libras** | Especialista Libras | 5, 6, 7 | Vídeos em Libras (min. 3), modo alto contraste, testes com surdos, Relatório de Acessibilidade |

---

## 7. Artefatos a Entregar

### Documentos (pasta `docs/`)

```
docs/
├── DOCUMENTACAO.md              ✅ já existe — Documentação técnica completa
├── PLANO_FACULDADE.md           ✅ este arquivo
├── Requisitos.md                ⏳ Sprint 2
├── Arquitetura.md               ⏳ Sprint 3
├── Proposta_Melhoria.md         ⏳ Sprint 2
├── Relatorio_Acessibilidade.md  ⏳ Sprint 7
├── Relatorio_Seguranca.md       ⏳ Sprint 7
└── diagramas/
    ├── BPMN_Agendamento.png     ⏳ Sprint 1
    ├── BPMN_Atendimento.png     ⏳ Sprint 1
    ├── BPMN_Produtos.png        ⏳ Sprint 1
    ├── SWOT.png                 ⏳ Sprint 1
    ├── UC_Diagram.png           ⏳ Sprint 2
    ├── Class_Diagram.png        ⏳ Sprint 2
    ├── Sequence_Agendamento.png ⏳ Sprint 3
    ├── Sequence_Cancelamento.png⏳ Sprint 3
    └── Activity_Diagram.png     ⏳ Sprint 7
```

### Código a Adicionar

```
Novo código a implementar:
├── drizzle/migrations/
│   ├── 0019_create_products.sql      ⏳ Sprint 3
│   ├── 0020_add_loyalty_points.sql   ⏳ Sprint 3
│   ├── 0021_add_pix_key_salon.sql    ⏳ Sprint 5
│   └── 0022_create_ratings.sql       ⏳ Sprint 6
├── client/src/pages/
│   ├── Products.tsx                  ⏳ Sprint 3
│   └── Rating.tsx                    ⏳ Sprint 6
└── client/src/components/
    ├── LibrasHelper.tsx               ⏳ Sprint 5
    ├── PixQRCode.tsx                  ⏳ Sprint 5
    └── AccessibilityBar.tsx           ⏳ Sprint 5
```

---

## 8. Decisões de Arquitetura

### Por que PWA e não Flutter/React Native?

O projeto já existe como uma aplicação web robusta. Desenvolver um app nativo em paralelo dobraria o trabalho sem adicionar valor acadêmico. A justificativa técnica é:

| Critério | PWA | Flutter/React Native |
|---------|-----|---------------------|
| Código único para web + mobile | ✅ Sim | ❌ Não |
| Sem necessidade de aprovação na App Store | ✅ Sim | ❌ Não |
| Suporte a câmera e GPS | ✅ Via Web APIs | ✅ Sim |
| Notificações push | ✅ Via Web Push | ✅ Sim |
| Performance | ✅ Boa (Vite + React 19) | ✅ Nativa |
| Tempo de desenvolvimento | ✅ Menor | ❌ Maior |
| Projetos que usam: | Twitter Lite, Starbucks, Pinterest | Muitos apps tradicionais |

### Tecnologias Já Escolhidas

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React 19 + TypeScript | Maior ecossistema, equipe experiente |
| Backend | Node.js + Express + tRPC | Same-language fullstack, type safety |
| Banco | PostgreSQL + Drizzle ORM | Relacional robusto, migrations automáticas |
| Mobile | PWA (vite-plugin-pwa) | Sem duplicação de código |
| Deploy | Docker + docker-compose | Reprodutível e portável |
| Imagens | Cloudinary | Free tier suficiente para o projeto |

### Tópico Especial Recomendado: PIX Integrado

**Por que PIX:**
- Tecnologia brasileira com enorme adoção
- Relevante para salões de beleza (pagamento na hora)
- Implementação viável no prazo (QR Code estático com lib simples)
- Diferencial real no mercado

**Alternativa:** Chatbot com IA para agendamento via WhatsApp (usando Twilio + OpenAI API)

---

*Documento criado para o Projeto Integrado IV — 2026.1*  
*Última atualização: Março de 2026*
