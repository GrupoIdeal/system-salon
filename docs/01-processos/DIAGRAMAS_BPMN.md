# Diagramas BPMN - BizFlow Access

## Processo 1: Fluxo de Vendas (Agendamento → Pagamento)

```mermaid
graph TB
    subgraph "Cliente"
        A1[Início] --> A2[Busca serviços disponíveis]
        A2 --> A3[Seleciona serviço]
        A3 --> A4[Escolhe especialista]
        A4 --> A5[Seleciona data/horário]
        A5 --> A6[Informa dados pessoais]
        A6 --> A7{Agendamento criado}
    end

    subgraph "Sistema"
        A7 --> A8[Valida disponibilidade]
        A8 --> A9[Registra agendamento]
        A9 --> A10[Envia confirmação]
        A10 --> A11[Agenda lembretes 24h/2h]
    end

    subgraph "Salão"
        A11 --> A12{Atendimento realizado?}
        A12 -->|Sim| A13[Registra conclusão]
        A12 -->|Não| A14[Cancelamento]
        A13 --> A15[Adiciona produtos]
        A15 --> A16[Registra pagamento]
        A16 --> A17[Gera link avaliação]
        A17 --> A18[Acumula pontos fidelidade]
        A14 --> A19[Notifica cancelamento]
        A14 --> A20[Lista de espera]
    end

    A18 --> F1[Fim]
    A19 --> F1
    A20 --> F1
```

## Processo 2: Fluxo de Atendimento ao Cliente (Ticket → Resolução)

```mermaid
graph TB
    subgraph "Cliente"
        B1[Início] --> B2[Acessa chat/suporte]
        B2 --> B3[Abre ticket]
        B3 --> B4[Descreve solicitação]
    end

    subgraph "Sistema"
        B4 --> B5[Categoriza ticket]
        B5 --> B6[Atribui prioridade]
        B6 --> B7[Notifica equipe]
        B7 --> B8{Ticket em andamento}
    end

    subgraph "Atendente"
        B8 --> B9[Analisa solicitação]
        B9 --> B10[Responde cliente]
        B10 --> B11{Problema resolvido?}
        B11 -->|Sim| B12[Fecha ticket]
        B11 -->|Não| B13[Escala para superior]
        B13 --> B9
    end

    subgraph "Pós-atendimento"
        B12 --> B14[Enquete satisfação]
        B14 --> B15[Registra no CRM]
        B15 --> B16[Atualiza histórico cliente]
    end

    B16 --> F2[Fim]
```

## Processo 3: Fluxo de Controle de Estoque (Entrada → Alerta → Reposição)

```mermaid
graph TB
    subgraph "Fornecedor"
        C1[Início] --> C2[Envia produtos]
        C2 --> C3[Nota fiscal]
    end

    subgraph "Salão"
        C3 --> C4[Conferência mercadoria]
        C4 --> C5{Conforme?}
        C5 -->|Sim| C6[Registra entrada no estoque]
        C5 -->|Não| C7[Devolução]
        C6 --> C8[Atualiza quantidades]
        C8 --> C9[Produto disponível para venda]
    end

    subgraph "Sistema"
        C9 --> C10[Monitora níveis estoque]
        C10 --> C11{Estoque < mínimo?}
        C11 -->|Sim| C12[Gera alerta automático]
        C11 -->|Não| C10
        C12 --> C13[Notifica administrador]
        C13 --> C14[Recomenda quantidade compra]
    end

    subgraph "Venda"
        C14 --> C15{Produto vendido?}
        C15 -->|Sim| C16[Baixa no estoque]
        C16 --> C17[Atualiza relatório]
        C17 --> C10
        C15 -->|Não| C18[Ajuste manual?]
        C18 -->|Sim| C19[Correção inventário]
        C18 -->|Não| C10
    end

    C7 --> F3[Fim]
    C19 --> F3
```

## Matriz SWOT

```mermaid
quadrantChart
    quadrant-1 Ameaças
    quadrant-2 Forças
    quadrant-3 Fraquezas
    quadrant-4 Oportunidades
    title SWOT BizFlow Access
    "Concorrentes estabelecidos": [0.85, 0.15] 
    "Mudanças regulatórias": [0.75, 0.25]
    "App nativo vs PWA": [0.65, 0.35]
    "Dados sensíveis LGPD": [0.9, 0.1]
    "Equipe multidisciplinar": [0.2, 0.85]
    "Código modular e type-safe": [0.25, 0.9]
    "PWA cross-platform": [0.15, 0.75]
    "Acessibilidade embutida": [0.3, 0.8]
    "Documentação incompleta": [0.8, 0.7]
    "Zero testes automatizados": [0.75, 0.65]
    "Falta Libras": [0.85, 0.75]
    "Equipe pequena": [0.7, 0.6]
    "Mercado de beleza em crescimento": [0.2, 0.2]
    "Lei de acessibilidade digital": [0.3, 0.15]
    "Parceria comunidade surda": [0.1, 0.1]
    "Expansão para foodtech/varejo": [0.15, 0.25]
```
