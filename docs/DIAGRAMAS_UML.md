# Diagramas UML - BizFlow Access

## 1. Diagrama de Casos de Uso

```mermaid
graph TB
    subgraph "Sistema BizFlow Access"
        UC1[Fazer Login]
        UC2[Gerenciar Clientes]
        UC3[Gerenciar Serviços]
        UC4[Gerenciar Agendamentos]
        UC5[Gerenciar Produtos]
        UC6[Gerenciar Especialistas]
        UC7[Visualizar Dashboard]
        UC8[Emitir Relatórios]
        UC9[Gerenciar Empresa]
        UC10[Gerenciar Usuários]
        UC11[Agendar via Público]
        UC12[Avaliar Atendimento]
        UC13[Ver Ajuda Libras]
        UC14[Gerenciar Estoque]
    end

    subgraph "Atores"
        A1[Administrador]
        A2[Usuário Comum]
        A3[Cliente Externo]
    end

    A1 --> UC1
    A1 --> UC2
    A1 --> UC3
    A1 --> UC4
    A1 --> UC5
    A1 --> UC6
    A1 --> UC7
    A1 --> UC8
    A1 --> UC9
    A1 --> UC10
    A1 --> UC14

    A2 --> UC1
    A2 --> UC2
    A2 --> UC3
    A2 --> UC4
    A2 --> UC5
    A2 --> UC6
    A2 --> UC7
    A2 --> UC13

    A3 --> UC11
    A3 --> UC12
```

## 2. Diagrama de Classes

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String password
        +String name
        +Enum role
        +DateTime createdAt
        +JSON permissions
        +login()
        +resetPassword()
    }

    class Salon {
        +String id
        +String name
        +String cnpj
        +String address
        +String phone
        +String pixKey
        +String logo
        +DateTime createdAt
        +update()
    }

    class Specialist {
        +String id
        +String name
        +String specialty
        +String photo
        +JSON workingDays
        +Enum status
        +getAvailableSlots()
    }

    class SpecialistSchedule {
        +Int timeSlotDuration
        +Int bufferTime
        +Int allowBookingDaysInAdvance
        +JSON workingHours
        +JSON unavailableDates
        +getTimeSlots()
    }

    class Client {
        +String id
        +String name
        +String email
        +String phone
        +Int loyaltyPoints
        +String photo
        +addPoints()
    }

    class Service {
        +String id
        +String name
        +String description
        +Int duration
        +Decimal price
        +Boolean priceFrom
        +Enum status
    }

    class Appointment {
        +String id
        +Date appointmentDate
        +String appointmentTime
        +Enum status
        +Decimal paidAmount
        +Boolean isPublic
        +confirm()
        +complete()
        +cancel()
    }

    class Product {
        +String id
        +String name
        +Int stock
        +Int minStock
        +Decimal costPrice
        +Decimal sellPrice
        +isLowStock()
    }

    class Transaction {
        +String id
        +Enum type
        +Enum status
        +Enum paymentMethod
        +Decimal amount
        +DateTime transactionDate
    }

    class Rating {
        +String id
        +String token
        +Int stars
        +String comment
        +Boolean used
        +DateTime submittedAt
    }

    class AuditLog {
        +String id
        +String action
        +String entity
        +JSON before
        +JSON after
        +DateTime createdAt
    }

    Salon "1" --> "*" Specialist
    Salon "1" --> "*" Client
    Salon "1" --> "*" Service
    Salon "1" --> "*" Product
    Salon "1" --> "*" Appointment
    Salon "1" --> "*" Transaction
    Salon "1" --> "*" User
    Specialist "1" --> "1" SpecialistSchedule
    Specialist "1" --> "*" Appointment
    Specialist "1" --> "*" Rating
    Client "1" --> "*" Appointment
    Client "1" --> "*" Transaction
    Service "1" --> "*" Appointment
    Appointment "1" --> "*" Transaction
    Appointment "1" --> "1" Rating
    User "1" --> "1" Salon
    User "1" --> "*" AuditLog
```

## 3. Diagrama de Sequência - Fluxo de Agendamento

```mermaid
sequenceDiagram
    participant C as Cliente
    participant S as Sistema
    participant DB as Banco de Dados
    participant N as Notificação

    C->>S: Acessa página pública (/agendar)
    S->>DB: Busca serviços disponíveis
    DB-->>S: Lista de serviços
    S-->>C: Exibe serviços
    
    C->>S: Seleciona serviço
    S->>DB: Busca especialistas disponíveis
    DB-->>S: Lista de especialistas
    S-->>C: Exibe especialistas

    C->>S: Seleciona especialista + data
    S->>DB: Busca horários disponíveis
    DB-->>S: Slots livres (não conflitantes)
    S-->>C: Exibe horários

    C->>S: Escolhe horário + informa dados
    S->>S: Valida dados (Zod)
    S->>DB: Cria agendamento
    DB-->>S: Agendamento criado

    S->>N: Agenda notificação de confirmação
    S->>N: Agenda lembrete 24h
    S->>N: Agenda lembrete 2h
    N-->>C: Envia confirmação (WhatsApp)

    S-->>C: Confirmação visual + detalhes
```

## 4. Diagrama de Atividades - Ciclo do Atendimento

```mermaid
graph TB
    A[Início] --> B[Cliente agenda]
    B --> C{Sistema valida disponibilidade?}
    C -->|Disponível| D[Agendamento confirmado]
    C -->|Indisponível| E[Sugere horários alternativos]
    E --> B
    
    D --> F[Sistema notifica cliente]
    F --> G[Lembrete 24h antes]
    G --> H[Lembrete 2h antes]
    H --> I{Cliente comparece?}
    
    I -->|Sim| J[Atendimento realizado]
    J --> K[Salão registra conclusão]
    K --> L[Adiciona produtos usados]
    L --> M[Registra pagamento - PIX/Cartão/Dinheiro]
    M --> N[Gera link de avaliação]
    N --> O[Acumula pontos fidelidade]
    O --> P[Cliente avalia atendimento]
    P --> Q[Fim]
    
    I -->|Não| R{Cliente cancelou?}
    R -->|Sim| S[Atualiza status para cancelado]
    R -->|Não| T[Marca como no-show]
    T --> S
    S --> U[Notifica cancelamento]
    U --> V[Disponibiliza horário na lista de espera]
    V --> W{Aguardando na lista?}
    W -->|Sim| X[Notifica próximo da fila]
    X --> Q
    W -->|Não| Q
```
