/** biome-ignore-all assist/source/organizeImports: false positive */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { users, salons } from "../drizzle/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

// Carregar variáveis de ambiente
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Environment variable DATABASE_URL is not set");
}
const client = postgres(databaseUrl);
const db = drizzle(client);

async function main() {
  const passwordHash = await bcrypt.hash("123123", 10);

  // Verificar se o usuário já existe
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "adm@admin.com"));

  let userId: string;
  if (existingUser.length > 0) {
    console.log("👤 Usuário admin já existe, usando o existente...");
    userId = existingUser[0].id;
  } else {
    userId = nanoid();
    // Criar usuário administrador
    await db.insert(users).values({
      id: userId,
      email: "adm@admin.com",
      password: passwordHash,
      name: "Administrador",
      role: "admin",
    });
    console.log("✅ Usuário admin criado com sucesso!");
  }

  // Verificar se o salão já existe para este usuário
  const existingSalon = await db
    .select()
    .from(salons)
    .where(eq(salons.userId, userId));

  if (existingSalon.length > 0) {
    console.log("🏢 Dados da empresa já existem!");
  } else {
    const salonId = nanoid();

    // Criar dados da empresa/salão
    await db.insert(salons).values({
      id: salonId,
      userId: userId,
      name: "Graciosa Studio de Beleza",
      cnpj: "99988877700",
      address: "Rua Dez, 40",
      phone: "88999999777",
      email: "teste@teste.com",
      workingHours: {
        // Segunda a Sexta: 08:00-12:00 e 14:00-18:00
        monday: [
          {
            start: "08:00",
            end: "12:00",
          },
          {
            start: "14:00",
            end: "18:00",
          },
        ],
        tuesday: [
          {
            start: "08:00",
            end: "12:00",
          },
          {
            start: "14:00",
            end: "18:00",
          },
        ],
        wednesday: [
          {
            start: "08:00",
            end: "12:00",
          },
          {
            start: "14:00",
            end: "18:00",
          },
        ],
        thursday: [
          {
            start: "08:00",
            end: "12:00",
          },
          {
            start: "14:00",
            end: "18:00",
          },
        ],
        friday: [
          {
            start: "08:00",
            end: "12:00",
          },
          {
            start: "14:00",
            end: "18:00",
          },
        ],
        // Sábado: 08:00-13:00
        saturday: [
          {
            start: "08:00",
            end: "13:00",
          },
        ],
        // Domingo: fechado
        sunday: [],
      },
    });
    console.log("✅ Dados da empresa criados com sucesso!");
  }

  console.log("✅ Horários de funcionamento configurados!");
  console.log("\n📧 Email: adm@admin.com");
  console.log("🔑 Senha: 123123");

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
