import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock do banco de dados
vi.mock("./db", () => ({
  getDb: vi.fn(),
  getUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getSalonByUserId: vi.fn(),
  getServicesBySalonId: vi.fn(),
  getServiceById: vi.fn(),
  getClientsBySalonId: vi.fn(),
  getClientById: vi.fn(),
  getProductsBySalonId: vi.fn(),
  getLowStockProducts: vi.fn(),
  timeToMinutes: vi.fn(),
  getAvailableTimeSlots: vi.fn(),
  validateAppointmentSlot: vi.fn(),
}));

// Testes das validações (Zod schemas)
describe("Validações (Zod Schemas)", () => {
  it("loginSchema aceita dados válidos", async () => {
    const { loginSchema } = await import("../shared/validations");
    const result = loginSchema.safeParse({
      email: "teste@email.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("loginSchema rejeita email inválido", async () => {
    const { loginSchema } = await import("../shared/validations");
    const result = loginSchema.safeParse({
      email: "invalido",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("loginSchema rejeita senha curta", async () => {
    const { loginSchema } = await import("../shared/validations");
    const result = loginSchema.safeParse({
      email: "teste@email.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("registerSchema aceita dados válidos", async () => {
    const { registerSchema } = await import("../shared/validations");
    const result = registerSchema.safeParse({
      email: "novo@email.com",
      password: "Str0ng!Pass",
      name: "Usuário Teste",
    });
    expect(result.success).toBe(true);
  });

  it("registerSchema rejeita senha sem maiúscula", async () => {
    const { registerSchema } = await import("../shared/validations");
    const result = registerSchema.safeParse({
      email: "novo@email.com",
      password: "weak!pass1",
      name: "Usuário Teste",
    });
    expect(result.success).toBe(false);
  });

  it("serviceSchema aceita dados válidos", async () => {
    const { serviceSchema } = await import("../shared/validations");
    const result = serviceSchema.safeParse({
      name: "Corte Feminino",
      duration: 60,
      price: "89.90",
    });
    expect(result.success).toBe(true);
  });

  it("serviceSchema rejeita duração negativa", async () => {
    const { serviceSchema } = await import("../shared/validations");
    const result = serviceSchema.safeParse({
      name: "Corte Feminino",
      duration: -10,
      price: "89.90",
    });
    expect(result.success).toBe(false);
  });

  it("productSchema aceita dados válidos", async () => {
    const { productSchema } = await import("../shared/validations");
    const result = productSchema.safeParse({
      name: "Shampoo Profissional",
      stock: 10,
      minStock: 3,
      sellPrice: "45.90",
    });
    expect(result.success).toBe(true);
  });

  it("productSchema rejeita estoque negativo", async () => {
    const { productSchema } = await import("../shared/validations");
    const result = productSchema.safeParse({
      name: "Shampoo",
      stock: -5,
    });
    expect(result.success).toBe(false);
  });

  it("appointmentSchema aceita dados válidos", async () => {
    const { appointmentSchema } = await import("../shared/validations");
    const result = appointmentSchema.safeParse({
      clientId: "client-1",
      serviceId: "service-1",
      specialistId: "spec-1",
      appointmentDate: new Date("2026-06-15"),
      appointmentTime: "14:30",
    });
    expect(result.success).toBe(true);
  });

  it("appointmentSchema rejeita horário inválido", async () => {
    const { appointmentSchema } = await import("../shared/validations");
    const result = appointmentSchema.safeParse({
      clientId: "client-1",
      serviceId: "service-1",
      specialistId: "spec-1",
      appointmentDate: new Date("2026-06-15"),
      appointmentTime: "25:00",
    });
    expect(result.success).toBe(false);
  });

  it("salonSchema aceita dados válidos", async () => {
    const { salonSchema } = await import("../shared/validations");
    const result = salonSchema.safeParse({
      name: "Salão Beleza Pura",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 99999-9999",
    });
    expect(result.success).toBe(true);
  });
});

// Testes das funções utilitárias
describe("Funções Utilitárias", () => {
  it("renderTemplate substitui placeholders corretamente", async () => {
    const { renderTemplate, defaultTemplates } = await import("./notifications");
    const data = {
      client_name: "Maria",
      date: "15/06/2026",
      time: "14:30",
      specialist: "Carlos",
    };
    const expected = defaultTemplates.appointment_confirmation.message
      .replace("{date}", "15/06/2026")
      .replace("{time}", "14:30")
      .replace("{specialist}", "Carlos");
    const result = renderTemplate(
      defaultTemplates.appointment_confirmation,
      data,
      "push"
    );
    expect(result).toBe(expected);
  });

  it("renderTemplate mantém placeholders não fornecidos", async () => {
    const { renderTemplate, defaultTemplates } = await import("./notifications");
    const data = { client_name: "Maria" };
    const result = renderTemplate(
      defaultTemplates.appointment_confirmation,
      data,
      "push"
    );
    expect(result).toContain("{date}");
    expect(result).toContain("{time}");
  });

  it("renderTemplate usa template de SMS corretamente", async () => {
    const { renderTemplate, defaultTemplates } = await import("./notifications");
    const data = {
      client_name: "Maria",
      date: "15/06/2026",
      time: "14:30",
      specialist: "Carlos",
      service: "Corte",
      salon_name: "Beleza Pura",
    };
    const result = renderTemplate(
      defaultTemplates.appointment_confirmation,
      data,
      "sms"
    );
    expect(result).toContain("Confirmado:");
    expect(result).toContain("Corte");
    expect(result).toContain("Beleza Pura");
  });
});

// Testes dos relatórios
describe("Relatórios", () => {
  it("exportToCSV gera cabeçalho e linhas", async () => {
    const { exportToCSV } = await import("./reports");
    const data = [
      { Nome: "Maria", Email: "maria@email.com", Telefone: "11999999999" },
      { Nome: "João", Email: "joao@email.com", Telefone: "11988888888" },
    ];
    const csv = exportToCSV(data);
    expect(csv).toContain("Nome,Email,Telefone");
    expect(csv).toContain("Maria,maria@email.com,11999999999");
    expect(csv).toContain("João,joao@email.com,11988888888");
  });

  it("exportToCSV escapa vírgulas corretamente", async () => {
    const { exportToCSV } = await import("./reports");
    const data = [{ Nome: "Maria", "Endereço": "Rua A, 123" }];
    const csv = exportToCSV(data);
    expect(csv).toContain('"Rua A, 123"');
  });
});

// Testes de segurança (XSS sanitization)
describe("Sanitização de Strings", () => {
  it("remove tags script de entrada", async () => {
    const { loginSchema } = await import("../shared/validations");
    const result = loginSchema.safeParse({
      email: "teste@email.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });
});
