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

## 5. Diagrama de Estados — Ciclo de Vida do Agendamento

```mermaid
stateDiagram-v2
    [*] --> Pending: Cliente cria agendamento

    Pending --> Confirmed: Admin confirma\nou auto-confirm
    Pending --> Cancelled: Cliente/Admin cancela
    Pending --> [*]: Admin remove

    Confirmed --> Completed: Admin conclui atendimento\n(registra pagamento + produtos)
    Confirmed --> Cancelled: Cliente/Admin cancela\n(motivo registrado)
    Confirmed --> NoShow: Cliente não comparece

    Completed --> RatingPending: Token de avaliação gerado\n(link enviado ao cliente)
    RatingPending --> Rated: Cliente submete avaliação\n(1-5 estrelas + comentário)
    RatingPending --> RatingExpired: Token expira\n(sem avaliação)

    Cancelled --> WaitlistAvailable: Horário liberado\npara lista de espera
    NoShow --> WaitlistAvailable: Horário liberado\npara lista de espera

    Completed --> [*]
    Rated --> [*]
    RatingExpired --> [*]
    Cancelled --> [*]
    WaitlistAvailable --> [*]
```

## 6. Diagrama de Componentes

```mermaid
graph TB
    subgraph "Frontend — React SPA (client/)"
        direction TB
        subgraph "Páginas (pages/)"
            P1[Login]
            P2[Dashboard]
            P3[Agendamentos]
            P4[Clientes]
            P5[Serviços]
            P6[Especialistas]
            P7[Produtos]
            P8[Agendamento Público]
            P9[Avaliação]
            P10[Empresa/Usuários/Logs]
        end

        subgraph "Componentes de Negócio (components/)"
            C1[AppointmentModal]
            C2[CompleteAppointmentModal]
            C3[CalendarPicker]
            C4[TimeSlotPicker]
            C5[DashboardLayout]
            C6[PixQRCode]
            C7[AccessibilityBar]
            C8[SpecialistScheduleManagement]
        end

        subgraph "Infraestrutura Frontend"
            F1[tRPC Client]
            F2[React Query Cache]
            F3[Auth Context]
            F4[Theme Context]
            F5[Service Worker PWA]
        end

        P1 --> F3
        P2 --> C5
        P3 --> C1
        P3 --> C2
        C1 --> C3
        C1 --> C4
        C2 --> C6
        P8 --> C4
        P1 --> F1
        P2 --> F1
        P3 --> F1
        F1 --> F2
    end

    subgraph "Backend — Node.js + Express (server/)"
        direction TB
        subgraph "Camada de API (_core/)"
            B1[Express Server]
            B2[tRPC Router]
            B3[Auth Middleware]
            B4[Rate Limiter + Helmet]
        end

        subgraph "Módulos de Negócio"
            M1[routers.ts — Procedures tRPC]
            M2[db.ts — Acesso ao Banco]
            M3[notifications.ts — Templates]
            M4[reports.ts — Relatórios CSV]
            M5[specialist-schedule.ts]
            M6[waitlist.ts — Lista de Espera]
            M7[public-booking.ts]
            M8[cloudinary.ts — Upload]
            M9[stripe.ts — Pagamentos]
        end

        B1 --> B4
        B4 --> B2
        B2 --> B3
        B2 --> M1
        M1 --> M2
        M1 --> M3
        M1 --> M4
        M1 --> M5
        M1 --> M6
        M1 --> M7
        M1 --> M8
    end

    subgraph "Camada Compartilhada (shared/)"
        S1[validations.ts — Zod Schemas]
        S2[types.ts — Tipos TypeScript]
        S3[const.ts — Constantes]
    end

    subgraph "Banco de Dados (drizzle/)"
        D1[schema.ts — Tabelas]
        D2[relations.ts — Relacionamentos]
        D3[migrations/ — SQL Migrations]
        D4[seed-admin.ts — Dados Iniciais]
    end

    F1 -->|HTTP POST /api/trpc| B2
    M2 -->|SQL via Drizzle ORM| DB[(PostgreSQL 16)]
    D1 --> M2
    S1 --> M1
    S1 --> F1
```

## 7. Diagrama de Implantação (Deployment)

```mermaid
graph TB
    subgraph "Dispositivo do Cliente"
        Browser["Navegador Web\n(Chrome, Safari, Firefox)"]
        Mobile["Smartphone\n(Android / iOS)"]
    end

    subgraph "PWA Instalável"
        SW["Service Worker\n(Cache Offline - Workbox)"]
        Manifest["manifest.json\n(ícones, nome, cores)"]
    end

    subgraph "Servidor de Produção (Docker)"
        subgraph "Container: app (Node.js 20 Alpine)"
            Express["Express Server\n(Porta 3000)"]
            Static["Frontend Estático\n(Vite Build → dist/)"]
            TRPC["tRPC API\n(/api/trpc/*)"]
        end

        subgraph "Container: db (PostgreSQL 16 Alpine)"
            PG["PostgreSQL 16\n(Porta 5432)"]
            Volume["Volume: postgres_data\n(Persistência)"]
        end

        Express --> Static
        Express --> TRPC
        PG --> Volume
    end

    subgraph "Serviços Externos"
        Cloudinary["Cloudinary\n(Upload de Imagens)"]
        SMTP["Servidor SMTP\n(Emails - futuro)"]
        WhatsApp["API WhatsApp\n(Notificações - futuro)"]
    end

    Browser -->|"HTTPS\n(SPA + API)"| Express
    Mobile -->|"PWA Install\n(HTTPS)"| Express
    Mobile --> SW
    SW -->|Cache First| Static
    TRPC -->|"SQL (Drizzle ORM)"| PG
    Express -->|"API REST"| Cloudinary
    Express -.->|"Futuro"| SMTP
    Express -.->|"Futuro"| WhatsApp

    subgraph "Rede Docker (app-network)"
        Express -->|"postgres://db:5432/salon"| PG
    end
```

## 8. Diagrama de Pacotes

```mermaid
graph TB
    subgraph "system-salon"
        subgraph "client/ — Frontend React"
            subgraph "client/src/pages"
                Pages[Login, Dashboard, Agendamentos\nClientes, Serviços, Especialistas\nProdutos, Avaliações, Logs\nAgendamento Público, Empresa]
            end
            subgraph "client/src/components"
                Components[AppointmentModal\nCompleteAppointmentModal\nCalendarPicker, TimeSlotPicker\nPixQRCode, AccessibilityBar\nDashboardLayout, ui/]
            end
            subgraph "client/src/hooks"
                Hooks[useCrud, useComposition\nuseMobile, usePushNotifications]
            end
            subgraph "client/src/contexts"
                Contexts[ThemeContext, AuthContext]
            end
            subgraph "client/src/lib"
                Lib[trpc.ts, utils.ts]
            end
        end

        subgraph "server/ — Backend Node.js"
            subgraph "server/_core"
                Core[index.ts, trpc.ts\ncontext.ts, env.ts\ncookies.ts, sdk.ts\nmiddleware.ts, vite.ts]
            end
            subgraph "server/modules"
                Modules[routers.ts, db.ts\nnotifications.ts, reports.ts\nspecialist-schedule.ts\nwaitlist.ts, public-booking.ts\ncloudinary.ts, stripe.ts\nstorage.ts, sync-schedules.ts]
            end
        end

        subgraph "shared/ — Código Compartilhado"
            Shared[validations.ts — Zod Schemas\ntypes.ts — Tipos TypeScript\nconst.ts — Constantes]
        end

        subgraph "drizzle/ — Banco de Dados"
            Drizzle[schema.ts — 12 Tabelas\nrelations.ts — Relacionamentos\nmigrations/ — SQL Migrations\nseed-admin.ts — Dados Iniciais]
        end

        subgraph "mobile/ — App React Native (Expo)"
            subgraph "mobile/src/app"
                MobilePages[Login, Tabs\nAppointments, Settings]
            end
            subgraph "mobile/src/components"
                MobileComponents[Button, Card\nAppointmentCard\nLoadingScreen]
            end
            subgraph "mobile/src/services"
                MobileServices[api.ts, trpc.ts\nnotifications.ts]
            end
            subgraph "mobile/src/contexts"
                MobileContexts[AuthContext\nOfflineContext]
            end
        end

        subgraph "Infraestrutura"
            Infra[Dockerfile\ndocker-compose.yml\nvite.config.ts\ndrizzle.config.ts\ntsconfig.json\neslint.config.js\nvitest.config.ts]
        end
    end

    Pages --> Components
    Pages --> Hooks
    Pages --> Lib
    Components --> Lib
    Lib -->|import AppRouter| Modules
    Core --> Modules
    Modules --> Drizzle
    Modules --> Shared
    Lib --> Shared
    Pages --> Contexts
    MobilePages --> MobileComponents
    MobilePages --> MobileServices
    MobileServices -->|import AppRouter| Modules
    MobileServices --> Shared
```
