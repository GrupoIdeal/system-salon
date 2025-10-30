/** biome-ignore-all assist/source/organizeImports: false positive */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { salons, specialists, services, clients } from "../drizzle/schema";
import { nanoid } from "nanoid";

// Carregar variáveis de ambiente
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Environment variable DATABASE_URL is not set");
}
const client = postgres(databaseUrl);
const db = drizzle(client);

async function main() {
  // Buscar o salão existente
  const salon = await db.select().from(salons).limit(1);

  if (salon.length === 0) {
    console.log("❌ Nenhum salão encontrado. Execute primeiro o seed-admin.ts");
    process.exit(1);
  }

  const salonId = salon[0].id;
  console.log(`🏢 Usando salão: ${salon[0].name}`);

  // Criar especialistas
  const specialists_data = [
    {
      id: nanoid(),
      salonId,
      name: "Ana Silva",
      specialty: "Cabelereiro",
      email: "ana@salon.com",
      phone: "11999998888",
      bio: "Especialista em cortes e coloração com 10 anos de experiência",
      workingDays: {
        monday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        tuesday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        wednesday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        thursday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        friday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        saturday: [{ start: "08:00", end: "13:00" }],
        sunday: [],
      },
      commissionRate: 60,
      status: "active" as const,
    },
    {
      id: nanoid(),
      salonId,
      name: "Carlos Mendes",
      specialty: "Barbeiro",
      email: "carlos@salon.com",
      phone: "11999997777",
      bio: "Barbeiro especializado em cortes masculinos e barba",
      workingDays: {
        tuesday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        wednesday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        thursday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        friday: [
          { start: "08:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
        saturday: [{ start: "08:00", end: "13:00" }],
        sunday: [],
        monday: [],
      },
      commissionRate: 60,
      status: "active" as const,
    },
  ];

  await db.insert(specialists).values(specialists_data);
  console.log(`✅ ${specialists_data.length} especialistas criados!`);

  // Criar serviços
  const services_data = [
    {
      id: nanoid(),
      salonId,
      name: "Corte Feminino",
      description: "Corte personalizado para cabelos femininos",
      price: "45.00",
      duration: 60,
      category: "Cabelo",
      status: "active" as const,
    },
    {
      id: nanoid(),
      salonId,
      name: "Corte Masculino",
      description: "Corte moderno para cabelos masculinos",
      price: "25.00",
      duration: 30,
      category: "Cabelo",
      status: "active" as const,
    },
    {
      id: nanoid(),
      salonId,
      name: "Escova",
      description: "Escova modeladora",
      price: "35.00",
      duration: 45,
      category: "Cabelo",
      status: "active" as const,
    },
    {
      id: nanoid(),
      salonId,
      name: "Coloração",
      description: "Coloração completa dos cabelos",
      price: "80.00",
      duration: 120,
      category: "Coloração",
      status: "active" as const,
    },
    {
      id: nanoid(),
      salonId,
      name: "Manicure",
      description: "Cuidados completos para as unhas das mãos",
      price: "20.00",
      duration: 45,
      category: "Unhas",
      status: "active" as const,
    },
    {
      id: nanoid(),
      salonId,
      name: "Pedicure",
      description: "Cuidados completos para as unhas dos pés",
      price: "25.00",
      duration: 60,
      category: "Unhas",
      status: "active" as const,
    },
  ];

  await db.insert(services).values(services_data);
  console.log(`✅ ${services_data.length} serviços criados!`);

  // Criar alguns clientes de exemplo
  const clients_data = [
    {
      id: nanoid(),
      salonId,
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "11999991111",
      notes: "Gosta de cortes mais conservadores",
    },
    {
      id: nanoid(),
      salonId,
      name: "João Oliveira",
      email: "joao@email.com",
      phone: "11999992222",
      notes: "Cliente regular, prefere cortes rápidos",
    },
    {
      id: nanoid(),
      salonId,
      name: "Julia Costa",
      email: "julia@email.com",
      phone: "11999993333",
      notes: "Adora experimentar cores diferentes",
    },
  ];

  await db.insert(clients).values(clients_data);
  console.log(`✅ ${clients_data.length} clientes criados!`);

  console.log("\n🎉 Dados de exemplo criados com sucesso!");
  console.log("📋 Resumo:");
  console.log(`   • ${specialists_data.length} especialistas`);
  console.log(`   • ${services_data.length} serviços`);
  console.log(`   • ${clients_data.length} clientes`);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
