# Análise do Projeto - BeautySalon Access vs. Projeto Integrado IV (2026.1)

> **Análise realizada por:** Analista Sênior de Tecnologia  
> **Data:** 14 de junho de 2026  
> **Projeto avaliado:** system-salon (BeautySalon Access)  
> **Requisitos de referência:** Projeto Integrado IV - 2026.1 (Faculdade CDL)

---

## 1. Resumo Executivo

O projeto **BeautySalon Access** é um sistema de gestão para salões de beleza com **excelente base técnica** (React + tRPC + PostgreSQL + PWA). No entanto, para atender plenamente aos requisitos do **Projeto Integrado IV (2026.1)**, são necessárias **melhorias significativas em 5 áreas críticas**:

| Área | Status Atual | Nota | Prioridade |
|------|-------------|------|------------|
| Gestão de Processos (BPMN/SWOT) | Documentação existe mas pode ser aprimorada | 6/10 | Alta |
| Programação Mobile (30%) | **Não atende** — App não funciona, sem SQLite, sem push real | 2/10 | **Crítica** |
| Análise e Projeto de Sistemas | UML existe, mas falta Figma, requisitos formais, arquitetura | 5/10 | Alta |
| Tópicos Especiais (15%) | Docker (1/2) — Falta 2º tópico | 5/10 | Média |
| Libras/Acessibilidade (20%) | **Não atende** — Sem vídeos, sem vídeo-chamada, sem testes reais | 3/10 | **Crítica** |
| Módulos do BizFlow Access | Parcial — Falta Chat, CRM, Tickets, Vendas | 4/10 | Alta |

**Nota geral estimada:** ~5.0/10 — **não atinge aprovação sem correções**.

---

## 2. Análise por Disciplina

### 2.1 Diagnóstico e Gestão de Processos (20% da nota)

#### Requisitos do PDF:
- Mapear e modelar pelo menos **3 processos comerciais reais** (fluxo de vendas, atendimento ao cliente, controle de estoque)
- Diagrama **BPMN** dos processos
- **Matriz SWOT** da situação atual
- Proposta de melhoria através da automação
- Documentação completa do diagnóstico

#### Estado Atual:
| Item | Status | Arquivo |
|------|--------|---------|
| BPMN dos processos | ✅ Existe | `docs/DIAGRAMAS_BPMN.md` |
| Matriz SWOT | ✅ Existe | `docs/DIAGRAMAS_BPMN.md` |
| Proposta de melhoria | ⚠️ Básica | Mesmo arquivo |
| 3 processos comerciais | ✅ Sim | Vendas, atendimento, estoque |

**Diagnóstico:** O grupo já tem a documentação de processos. **Recomendação:** Apenas revisar e enriquecer com métricas de tempo/custo antes/depois.

#### Tarefas:
- [ ] Revisar BPMN e garantir que está alinhado com o sistema real (não documentação desatualizada)
- [ ] Adicionar métricas quantitativas na proposta de melhoria (ex: "tempo de agendamento reduziu de 15min para 2min")
- [ ] Criar um documento separado de **diagnóstico AS-IS vs TO-BE** com evidências

---

### 2.2 Programação para Dispositivos Móveis (30% da nota)

#### Requisitos do PDF:
- Desenvolvimento do **aplicativo nativo** (Android/iOS) ou cross-platform (React Native/Flutter)
- **Funcionalidades técnicas obrigatórias:**
  - Consumo de API REST
  - Armazenamento local (SQLite ou similar)
  - Notificações push
  - Câmera e geolocalização
  - Offline-first capability
- Entregáveis: Código-fonte, arquivo APK/IPA, documentação técnica

#### Estado Atual:
| Funcionalidade | Status | Problema |
|----------------|--------|----------|
| App móvel funcional | ❌ **NÃO** | BottomNav não aparece (bug crítico). App é apenas PWA empacotada |
| Consumo de API | ⚠️ Parcial | Usa tRPC, não REST. Funciona na web mas no mobile precisa de CORS |
| Armazenamento local (SQLite) | ❌ **NÃO** | Não existe. App depende 100% da internet |
| Notificações push | ❌ **NÃO** | Chave VAPID é fake (`BIs_fake_VAPID_PUBLIC_KEY_replace_in_production`) |
| Câmera | ⚠️ Parcial | Plugin instalado mas não usado. Web usa apenas `<input type="file">` |
| Geolocalização | ✅ Sim | Implementado na PublicBooking |
| Offline-first | ❌ **NÃO** | Service Worker cacheia assets, mas não dados ou ações offline |
| APK funcional | ❌ **NÃO** | Build gera APK, mas app não funciona corretamente |

**Diagnóstico:** Esta é a **maior falha do projeto**. O PDF exige um app móvel com funcionalidades nativas, e o projeto tem apenas uma **PWA empacotada** que sequer funciona. Isso pode custar **30% da nota**.

#### Tarefas (CRÍTICAS):
- [ ] **URGENTE:** Corrigir o bug da BottomNav (o usuário tentou 10x, nada funcionou)
- [ ] **URGENTE:** Decidir se será:
  - **Opção A:** Corrigir o Capacitor (mais rápido, mas não é "app nativo" de verdade)
  - **Opção B:** Criar app React Native/Expo do zero (melhor para nota, mais trabalho)
  - **Opção C:** Usar Capacitor + plugins nativos (meio-termo)
- [ ] Implementar **SQLite local** com `@capacitor-community/sqlite`
- [ ] Implementar **notificações push reais** com Firebase Cloud Messaging
- [ ] Implementar **câmera nativa** com `@capacitor/camera`
- [ ] Implementar **offline-first** (fila de sincronização quando volta online)
- [ ] Gerar **APK funcional** e testar em dispositivo físico
- [ ] Criar documentação técnica do app

**Recomendação:** Use a **Opção C** (Capacitor + plugins nativos). É mais rápido que refazer tudo e atende aos requisitos técnicos do PDF. O projeto já tem Capacitor configurado, falta apenas implementar os plugins.

---

### 2.3 Análise e Projeto de Sistemas (parte dos 20% de documentação)

#### Requisitos do PDF:
- Diagramas UML (Casos de Uso, Classes, Sequência, Atividades)
- Especificação de requisitos funcionais e não-funcionais
- Protótipos de alta fidelidade (Figma/Adobe XD)
- Documento de arquitetura do sistema

#### Estado Atual:
| Item | Status | Observação |
|------|--------|------------|
| UML (Casos de Uso, Classes, Sequência, Atividades) | ✅ Existe | `docs/DIAGRAMAS_UML.md` |
| Requisitos funcionais/não-funcionais | ⚠️ Básico | `docs/DOCUMENTACAO.md` tem, mas não é formal |
| Protótipos alta fidelidade (Figma) | ❌ **NÃO** | Não existe nenhuma prototipagem visual |
| Documento de arquitetura | ⚠️ Parcial | Não existe documento formal de arquitetura |

**Diagnóstico:** Os diagramas UML existem, mas **falta a prototipagem visual** (Figma), que é obrigatória no PDF. Também falta um **documento de arquitetura técnica** formal.

#### Tarefas:
- [ ] Criar **prototipagem no Figma** das 5 principais telas:
  - Dashboard
  - Agendamentos
  - Cadastro de Cliente
  - Agendamento Público
  - Tela de Acessibilidade
- [ ] Criar **especificação formal de requisitos** (lista numerada de RF e RNF)
- [ ] Criar **documento de arquitetura** (tecnologias, fluxo de dados, segurança)
- [ ] Revisar UML e garantir que está atualizado com o código real

---

### 2.4 Tópicos Especiais e Práticas em Desenvolvimento (15% - Inovação)

#### Requisitos do PDF:
- Implementar **pelo menos 2 tópicos especiais**:
  - Integração com IA (chatbot ou análise preditiva)
  - Realidade aumentada para visualização de produtos
  - Pagamentos digitais via PIX/Stripe
  - IoT (integração com dispositivos inteligentes)
  - Blockchain para rastreabilidade
  - Microsserviços e containers (Docker)

#### Estado Atual:
| Tópico | Status |
|--------|--------|
| Docker | ✅ Implementado (docker-compose.yml) |
| Pagamentos digitais (PIX/Stripe) | ✅ Implementado |
| IA / Chatbot | ❌ Não existe |
| Realidade Aumentada | ❌ Não existe |
| IoT | ❌ Não existe |
| Blockchain | ❌ Não existe |
| Microsserviços | ❌ Não existe (monolito) |

**Diagnóstico:** Já tem **2 tópicos** (Docker + PIX/Stripe). **Atenção:** O PDF diz "pelo menos 2", então tecnicamente está ok. Mas para se destacar, seria bom ter mais 1.

#### Tarefas:
- [ ] ✅ Docker já está feito — apenas documentar
- [ ] ✅ Pagamentos já estão feitos — apenas documentar
- [ ] **Opcional:** Implementar 1 tópico extra (recomendo **IA/Chatbot** — é o mais fácil de integrar)

---

### 2.5 Libras / Acessibilidade (20% da nota)

#### Requisitos do PDF:
- **Vídeos explicativos em Libras** para todas as funcionalidades principais
- Interface com ícones e navegação intuitiva
- **Opção de suporte por vídeo-chamada com intérprete**
- Documentação do sistema em formato acessível
- **Testes com usuários reais da comunidade surda**

#### Estado Atual:
| Item | Status |
|------|--------|
| Vídeos em Libras | ❌ Não existe |
| Interface intuitiva | ⚠️ Parcial (BottomNav quebrado = navegação ruim) |
| Vídeo-chamada com intérprete | ❌ Não existe |
| Documentação acessível | ⚠️ Existe página "Ajuda Libras" mas conteúdo é limitado |
| Testes com usuários surdos | ❌ Não existe |
| Alto contraste | ✅ Existe (classe `.high-contrast`) |
| Ajuste de fonte | ⚠️ Existe mas não sabemos se está funcionando |

**Diagnóstico:** Esta é a **segunda maior falha**. O PDF dedica **20% da nota** a acessibilidade em Libras, e o projeto tem apenas uma **página básica de ajuda**. Sem vídeos, sem vídeo-chamada, sem testes reais.

#### Tarefas (CRÍTICAS):
- [ ] **URGENTE:** Gravar **vídeos curtos em Libras** (2-3 min cada) explicando:
  - Como fazer login
  - Como agendar um serviço
  - Como cadastrar um cliente
  - Como usar o dashboard
  - Como usar a página de ajuda
  - (Pode usar YouTube, Vimeo, ou hospedar no próprio servidor)
- [ ] **URGENTE:** Integrar **vídeo-chamada** (WebRTC ou API como Daily.co, Twilio)
- [ ] Criar **documentação em formato acessível** (PDF com tags, ou HTML semântico)
- [ ] Organizar **teste com 2-3 usuários surdos** (pode ser virtual) e gravar feedback
- [ ] Corrigir a navegação (BottomNav funcional é essencial para acessibilidade)

---

## 3. Análise dos Módulos do Sistema "BizFlow Access"

O PDF exige 4 módulos específicos. Vamos comparar:

### A) Módulo de Gestão Comercial

| Requisito PDF | Status | O que falta |
|--------------|--------|-------------|
| Cadastro de clientes e produtos | ✅ | Já existe |
| Controle de pedidos e vendas | ❌ | Não existe módulo de vendas/pedidos |
| Gestão de estoque com alertas automáticos | ⚠️ | Alertas básicos, mas sem movimentação |
| Relatórios de desempenho comercial | ⚠️ | CSV existe, mas não é "desempenho comercial" |

**Tarefas:**
- [ ] Criar **módulo de vendas** (tela de PDV ou checkout de produtos)
- [ ] Adicionar **histórico de movimentação de estoque** (entrada/saída)
- [ ] Melhorar relatórios para incluir métricas de vendas (produtos mais vendidos, ticket médio)

### B) Módulo de Atendimento

| Requisito PDF | Status | O que falta |
|--------------|--------|-------------|
| Chat integrado com histórico | ❌ | Não existe |
| Sistema de tickets | ❌ | Não existe |
| Avaliação de satisfação | ✅ | Existe (página /avaliar) |
| Integração com CRM | ❌ | Não existe |

**Tarefas:**
- [ ] Implementar **chat simples** (WebSocket ou polling) entre cliente e admin
- [ ] Criar **sistema de tickets** (abrir, acompanhar, resolver)
- [ ] Criar **CRM básico** (histórico de interações, notas sobre clientes)

### C) Módulo de Acessibilidade

| Requisito PDF | Status | O que falta |
|--------------|--------|-------------|
| Central de recursos em Libras | ⚠️ | Existe página mas sem vídeos |
| Configurações adaptativas | ⚠️ | Alto contraste existe, mas pode expandir |
| Modo de alto contraste | ✅ | Existe |
| Navegação por voz e gestos | ❌ | Não existe |

**Tarefas:**
- [ ] Adicionar **vídeos em Libras** na central de recursos
- [ ] Implementar **navegação por voz** (Web Speech API)
- [ ] Adicionar mais configurações adaptativas (tamanho de fonte, animações, etc.)

### D) Módulo Analítico

| Requisito PDF | Status | O que falta |
|--------------|--------|-------------|
| Dashboard com métricas-chave | ✅ | Existe e está bom |
| Gráficos interativos | ✅ | Recharts implementado |
| Exportação de dados | ✅ | CSV existe |
| Alertas inteligentes | ❌ | Não existe |

**Tarefas:**
- [ ] Adicionar **alertas inteligentes** (ex: "Estoque baixo", "Meta de faturamento não atingida")
- [ ] Enviar alertas por e-mail ou notificação

---

## 4. Plano de Ação Priorizado

### Sprint 1 (Semana 1-2) — Foco: Mobile e Acessibilidade (Crítico)

**Objetivo:** Resolver os problemas que mais impactam a nota.

| Tarefa | Prioridade | Tempo Estimado |
|--------|------------|----------------|
| **Decidir e implementar a arquitetura mobile** (Capacitor + plugins nativos) | 🔴 Crítica | 3 dias |
| **Corrigir bug do BottomNav** (diagnóstico definitivo) | 🔴 Crítica | 2 dias |
| Implementar **SQLite local** com `@capacitor-community/sqlite` | 🔴 Crítica | 2 dias |
| Implementar **notificações push** com Firebase | 🔴 Crítica | 2 dias |
| Implementar **câmera nativa** no mobile | 🔴 Crítica | 1 dia |
| Implementar **offline-first** (fila de sincronização) | 🔴 Crítica | 2 dias |
| Gerar APK e testar em dispositivo físico | 🔴 Crítica | 1 dia |

**Entregável:** APK funcional com login, SQLite, push, câmera, offline.

### Sprint 2 (Semana 3-4) — Foco: Libras e Acessibilidade

| Tarefa | Prioridade | Tempo Estimado |
|--------|------------|----------------|
| Gravar **vídeos em Libras** (6 vídeos de 2-3 min) | 🔴 Crítica | 3 dias |
| Integrar vídeos na Central de Libras | 🔴 Crítica | 1 dia |
| Implementar **vídeo-chamada** com intérprete | 🔴 Crítica | 2 dias |
| Organizar **testes com usuários surdos** | 🔴 Crítica | 2 dias |
| Documentar resultados dos testes | 🔴 Crítica | 1 dia |

**Entregável:** Vídeos em Libras, vídeo-chamada funcional, relatório de testes.

### Sprint 3 (Semana 5-6) — Foco: Módulos Faltantes

| Tarefa | Prioridade | Tempo Estimado |
|--------|------------|----------------|
| Implementar **chat simples** (WebSocket) | 🟡 Alta | 2 dias |
| Implementar **sistema de tickets** | 🟡 Alta | 2 dias |
| Implementar **CRM básico** (histórico de interações) | 🟡 Alta | 2 dias |
| Implementar **módulo de vendas/PDV** | 🟡 Alta | 2 dias |
| Implementar **alertas inteligentes** no dashboard | 🟡 Alta | 1 dia |

**Entregável:** Chat, tickets, CRM, vendas, alertas funcionando.

### Sprint 4 (Semana 7-8) — Foco: Documentação e Entrega

| Tarefa | Prioridade | Tempo Estimado |
|--------|------------|----------------|
| Criar **prototipagem no Figma** | 🟡 Alta | 2 dias |
| Revisar e atualizar **UML** | 🟡 Alta | 1 dia |
| Criar **documento de arquitetura** | 🟡 Alta | 1 dia |
| Criar **especificação formal de requisitos** | 🟡 Alta | 1 dia |
| Revisar BPMN e SWOT | 🟢 Média | 1 dia |
| Documentar Docker e PIX (Tópicos Especiais) | 🟢 Média | 1 dia |
| Gerar APK final e testar | 🟡 Alta | 1 dia |
| Preparar apresentação final | 🟡 Alta | 2 dias |

**Entregável:** Toda documentação completa, APK final, apresentação.

---

## 5. Checklist de Entrega Final

### Obrigatório para aprovação:

- [ ] **APK funcional** instalado e testado em celular físico
- [ ] **SQLite local** funcionando (app funciona sem internet)
- [ ] **Notificações push** chegando no celular
- [ ] **Câmera** tirando foto e salvando
- [ ] **Geolocalização** funcionando no app
- [ ] **Offline-first** (fila de sincronização)
- [ ] **6 vídeos em Libras** gravados e integrados
- [ ] **Vídeo-chamada** com intérprete testada
- [ ] **Testes com 2+ usuários surdos** documentados
- [ ] **Chat** funcionando
- [ ] **Sistema de tickets** funcionando
- [ ] **Módulo de vendas/PDV** funcionando
- [ ] **Prototipagem no Figma** exportada
- [ ] **Documento de arquitetura** escrito
- [ ] **Requisitos formais** (RF/RNF) documentados
- [ ] **BPMN e SWOT** revisados
- [ ] **Documentação dos Tópicos Especiais** (Docker + PIX)
- [ ] **Apresentação final** preparada (slides + demo)

### Bônus (para nota máxima):
- [ ] Implementar 1 tópico extra (IA/Chatbot)
- [ ] Testes E2E automatizados
- [ ] CI/CD no GitHub Actions
- [ ] Monitoramento com Sentry

---

## 6. Recomendações Técnicas

### 6.1 Decisão Arquitetural: Mobile

**Problema:** O app atual é uma PWA empacotada com Capacitor. Isso **não é um app nativo** e não atende os requisitos técnicos do PDF.

**Opções:**

| Opção | Prós | Contras | Esforço | Nota esperada |
|-------|------|---------|---------|---------------|
| **A. Corrigir Capacitor** | Rápido, reaproveita código | Não é "nativo", pode não impressionar | 1-2 semanas | 5-6/10 |
| **B. React Native/Expo** | App nativo real, melhor nota | Refazer tudo, mais complexo | 4-6 semanas | 8-9/10 |
| **C. Capacitor + Plugins** | Meio-termo, funcionalidades nativas | Requer configuração nativa | 2-3 semanas | 7-8/10 |

**Recomendação:** Use a **Opção C** (Capacitor + plugins nativos). É o melhor custo-benefício para o tempo disponível.

### 6.2 Decisão: Vídeos em Libras

Não precisa contratar intérprete profissional. Opções:
1. **Buscar na comunidade:** Contatar centro de surdos local ou professor de Libras
2. **Gravar com colega:** Se alguém do grupo ou conhecido sabe Libras
3. **Usar intérprete online:** Plataformas como HandTalk (IA) ou contratar freelancer por 1-2 horas

**Cada vídeo precisa ter apenas 2-3 minutos.** Isso é rápido de gravar.

### 6.3 Decisão: Vídeo-chamada

Não implementar WebRTC do zero. Use APIs prontas:
- **Daily.co** (mais simples, 15 min de setup)
- **Twilio Video** (mais robusto)
- **Whereby** (embed simples)

---

## 7. Estrutura de Pastas para Documentação

Recomendo organizar a documentação assim:

```
docs/
├── 01-processos/
│   ├── BPMN.md
│   ├── SWOT.md
│   └── AS-IS_TO-BE.md
├── 02-requisitos/
│   ├── requisitos-funcionais.md
│   ├── requisitos-nao-funcionais.md
│   └── casos-de-uso.md
├── 03-uml/
│   ├── diagramas-uml.md
│   └── arquitetura-sistema.md
├── 04-mobile/
│   ├── documentacao-tecnica.md
│   └── manual-de-uso.md
├── 05-libras/
│   ├── videos/ (ou links)
│   ├── relatorio-testes.md
│   └── central-de-recursos.md
├── 06-topicos-especiais/
│   ├── docker.md
│   ├── pagamentos.md
│   └── (ia.md - opcional)
└── 07-prototipagem/
    └── figma/ (ou link)
```

---

## 8. Conclusão

O projeto **BeautySalon Access** tem uma **base técnica sólida** (backend, frontend, banco de dados, PWA) mas **falha em 2 áreas críticas** que representam **50% da nota**:

1. **Mobile (30%):** Não é um app nativo funcional. Precisa de SQLite, push, câmera, offline.
2. **Libras (20%):** Não tem vídeos, vídeo-chamada, ou testes reais.

**Com correções focadas nas 2-3 próximas semanas**, o projeto pode atingir nota **7-8/10**.

**Sem essas correções, a nota estimada é 5/10 (abaixo da média).**

---

**Analista:** Sênior de Tecnologia  
**Data:** 14/06/2026
