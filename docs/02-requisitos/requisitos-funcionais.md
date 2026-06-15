# Requisitos Funcionais — BeautySalon Access

**Projeto:** Projeto Integrado IV (2026.1)  
**Sistema:** BeautySalon Access — Sistema de Gestão para Salão de Beleza  
**Data:** 15 de junho de 2026

---

## RF01 a RF10 — Autenticação e Usuários

| Código | Requisito | Status |
|--------|-----------|--------|
| RF01 | O sistema deve permitir login com e-mail e senha | ✅ Implementado |
| RF02 | O sistema deve armazenar senhas com hash bcrypt | ✅ Implementado |
| RF03 | O sistema deve manter sessão via token JWT | ✅ Implementado |
| RF04 | O sistema deve permitir recuperação de senha via e-mail | ✅ Implementado |
| RF05 | O sistema deve permitir logout e remoção de sessão | ✅ Implementado |
| RF06 | O sistema deve ter papéis de usuário (admin e user) | ✅ Implementado |
| RF07 | O sistema deve permitir permissões granulares (manage_clients, manage_services, etc.) | ✅ Implementado |
| RF08 | O sistema deve registrar data e hora do último login | ✅ Implementado |
| RF09 | O sistema deve permitir criação de novos usuários (apenas admin) | ✅ Implementado |
| RF10 | O sistema deve permitir reset de senha de usuários pelo admin | ✅ Implementado |

---

## RF11 a RF20 — Clientes e Serviços

| Código | Requisito | Status |
|--------|-----------|--------|
| RF11 | O sistema deve permitir cadastro de clientes (nome, e-mail, telefone, observações) | ✅ Implementado |
| RF12 | O sistema deve permitir edição e exclusão de clientes | ✅ Implementado |
| RF13 | O sistema deve permitir busca de clientes por nome ou e-mail | ✅ Implementado |
| RF14 | O sistema deve permitir cadastro de serviços (nome, descrição, duração, preço) | ✅ Implementado |
| RF15 | O sistema deve permitir associação de serviço a especialista responsável | ✅ Implementado |
| RF16 | O sistema deve permitir indicador de preço "a partir de" nos serviços | ✅ Implementado |
| RF17 | O sistema deve permitir status ativo/inativo para serviços | ✅ Implementado |
| RF18 | O sistema deve impedir exclusão de serviço com agendamentos futuros | ✅ Implementado |
| RF19 | O sistema deve permitir cadastro de especialistas com foto, especialidade e bio | ✅ Implementado |
| RF20 | O sistema deve permitir configuração de horários de trabalho por dia da semana | ✅ Implementado |

---

## RF21 a RF30 — Agendamentos

| Código | Requisito | Status |
|--------|-----------|--------|
| RF21 | O sistema deve exibir calendário visual para seleção de data | ✅ Implementado |
| RF22 | O sistema deve calcular e exibir apenas horários disponíveis (considerando duração, buffer e agendamentos existentes) | ✅ Implementado |
| RF23 | O sistema deve permitir agendamento com escolha de serviço + especialista + horário | ✅ Implementado |
| RF24 | O sistema deve permitir confirmação, conclusão e cancelamento de agendamentos | ✅ Implementado |
| RF25 | O sistema deve registrar automaticamente receita ao concluir atendimento | ✅ Implementado |
| RF26 | O sistema deve permitir agendamento público sem necessidade de login | ✅ Implementado |
| RF27 | O sistema deve exibir histórico completo de agendamentos | ✅ Implementado |
| RF28 | O sistema deve permitir filtro por status (pendente, confirmado, concluído, cancelado) | ✅ Implementado |
| RF29 | O sistema deve exibir visões diária, semanal e mensal dos agendamentos | ✅ Implementado |
| RF30 | O sistema deve registrar produtos vendidos/utilizados em cada atendimento | ✅ Implementado |

---

## RF31 a RF40 — Produtos e Estoque

| Código | Requisito | Status |
|--------|-----------|--------|
| RF31 | O sistema deve permitir cadastro de produtos (nome, estoque, preço custo/venda) | ✅ Implementado |
| RF32 | O sistema deve permitir definir estoque mínimo por produto | ✅ Implementado |
| RF33 | O sistema deve alertar quando estoque de um produto estiver abaixo do mínimo | ✅ Implementado |
| RF34 | O sistema deve decrementar automaticamente o estoque ao vender produto no atendimento | ✅ Implementado |
| RF35 | O sistema deve permitir busca de produtos por nome ao adicionar ao atendimento | ✅ Implementado |
| RF36 | O sistema deve exibir indicador visual de estoque baixo nos cards de produto | ✅ Implementado |
| RF37 | O sistema deve permitir categorização de produtos (marca, categoria) | ✅ Implementado |
| RF38 | O sistema deve permitir status ativo/inativo para produtos | ✅ Implementado |
| RF39 | O sistema deve registrar preço unitário no momento da venda (snapshot) | ✅ Implementado |
| RF40 | O sistema deve exibir alerta de estoque baixo no Dashboard | ✅ Implementado |

---

## RF41 a RF50 — Financeiro e Pagamentos

| Código | Requisito | Status |
|--------|-----------|--------|
| RF41 | O sistema deve registrar transações financeiras vinculadas a agendamentos | ✅ Implementado |
| RF42 | O sistema deve suportar múltiplos métodos de pagamento (dinheiro, cartão, PIX, transferência) | ✅ Implementado |
| RF43 | O sistema deve gerar QR Code PIX ao selecionar pagamento via PIX | ✅ Implementado |
| RF44 | O sistema deve permitir cadastro da chave PIX nas configurações do salão | ✅ Implementado |
| RF45 | O sistema deve permitir registro de despesas e estornos | ✅ Implementado |
| RF46 | O sistema deve calcular comissão do especialista por atendimento | ✅ Implementado |
| RF47 | O sistema deve exibir resumo do total (serviço + produtos) no checkout | ✅ Implementado |
| RF48 | O QR Code PIX deve seguir o padrão EMV do Banco Central | ✅ Implementado |
| RF49 | O sistema deve exibir a chave PIX em texto com opção de copiar | ✅ Implementado |
| RF50 | O sistema deve associar método de pagamento à transação | ✅ Implementado |

---

## RF51 a RF60 — Dashboard e Relatórios

| Código | Requisito | Status |
|--------|-----------|--------|
| RF51 | O sistema deve exibir dashboard com KPIs (receita mensal, agendamentos hoje, clientes novos) | ✅ Implementado |
| RF52 | O sistema deve exibir gráfico de receita dos últimos 30 dias | ✅ Implementado |
| RF53 | O sistema deve exibir comparativo mês atual vs mês anterior | ✅ Implementado |
| RF54 | O sistema deve exibir ranking de serviços mais realizados | ✅ Implementado |
| RF55 | O sistema deve exibir ranking de especialistas por receita | ✅ Implementado |
| RF56 | O sistema deve exibir top 5 clientes por gasto total | ✅ Implementado |
| RF57 | O sistema deve exibir análise de risco de abandono de clientes | ✅ Implementado |
| RF58 | O sistema deve permitir exportação de relatórios em CSV | ✅ Implementado |
| RF59 | O sistema deve exibir relatório de performance por especialista | ✅ Implementado |
| RF60 | O sistema deve exibir taxa de ocupação e conclusão de agendamentos | ✅ Implementado |

---

## RF61 a RF70 — Avaliações e Fidelidade

| Código | Requisito | Status |
|--------|-----------|--------|
| RF61 | O sistema deve gerar token único de avaliação ao concluir atendimento | ✅ Implementado |
| RF62 | O sistema deve permitir que clientes avaliem com 1 a 5 estrelas via link público | ✅ Implementado |
| RF63 | O sistema deve permitir comentário opcional na avaliação | ✅ Implementado |
| RF64 | O sistema deve exibir média de avaliações por especialista | ✅ Implementado |
| RF65 | O sistema deve exibir página pública de avaliação via token único | ✅ Implementado |
| RF66 | O sistema deve invalidar token após uso (uso único) | ✅ Implementado |
| RF67 | O sistema deve exibir páginas de gerenciamento de avaliações recebidas | ✅ Implementado |
| RF68 | O sistema deve exibir distribuição de avaliações por nota (1★ a 5★) | ✅ Implementado |
| RF69 | O sistema deve permitir copiar link de avaliação para compartilhar | ✅ Implementado |
| RF70 | O sistema deve acumular pontos de fidelidade a cada atendimento concluído | ✅ Implementado |

---

## RF71 a RF80 — Acessibilidade e Libras

| Código | Requisito | Status |
|--------|-----------|--------|
| RF71 | O sistema deve oferecer modo de alto contraste | ✅ Implementado |
| RF72 | O sistema deve permitir ajuste de tamanho de fonte (+A/-A) | ✅ Implementado |
| RF73 | O sistema deve exibir alfabeto completo de Libras com imagens reais (A-Z + Ç) | ✅ Implementado |
| RF74 | O sistema deve exibir números 0-9 em Libras com imagens reais | ✅ Implementado |
| RF75 | O sistema deve exibir frases comuns em Libras com descrições de movimento | ✅ Implementado |
| RF76 | O sistema deve oferecer links para vídeos de apoio em Libras no YouTube | ✅ Implementado |
| RF77 | O sistema deve ter navegação responsiva adaptada para dispositivos móveis | ✅ Implementado |
| RF78 | O sistema deve manter preferências de acessibilidade salvas (localStorage) | ✅ Implementado |
| RF79 | O sistema deve ter suporte a navegação por teclado | ✅ Implementado |
| RF80 | O sistema deve ter interface com ícones intuitivos em todas as funcionalidades | ✅ Implementado |

---

## RF81 a RF85 — Infraestrutura e Segurança

| Código | Requisito | Status |
|--------|-----------|--------|
| RF81 | O sistema deve registrar trilha de auditoria de todas as ações (quem, o quê, quando) | ✅ Implementado |
| RF82 | O sistema deve exibir logs de auditoria com dados antes/depois em JSON | ✅ Implementado |
| RF83 | O sistema deve ter proteção contra XSS com sanitização de entradas | ✅ Implementado |
| RF84 | O sistema deve ter rate limiting contra ataques de força bruta | ✅ Implementado |
| RF85 | O sistema deve ser instalável como PWA com cache offline via Service Worker | ✅ Implementado |
