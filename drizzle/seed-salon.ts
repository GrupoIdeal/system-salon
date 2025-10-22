import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, salons } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function main() {
  // Buscar o usuário admin
  const adminUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "adm@salao.com"))
    .limit(1);

  if (adminUser.length === 0) {
    console.error(
      "Usuário admin não encontrado. Execute primeiro o script seed-admin.ts"
    );
    process.exit(1);
  }

  const userId = adminUser[0].id;

  // Configuração dos horários de trabalho: 8h às 12h e 14h às 18h de segunda a sábado
  const workingHours = {
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
    saturday: [
      { start: "08:00", end: "12:00" },
      { start: "14:00", end: "18:00" },
    ],
    sunday: [],
  };

  // Verificar se já existe um salão para este usuário
  const existingSalon = await db
    .select()
    .from(salons)
    .where(eq(salons.userId, userId))
    .limit(1);

  if (existingSalon.length > 0) {
    // Atualiza todos os dados do salão existente
    await db
      .update(salons)
      .set({
        name: "Graciosa Studio de Beleza",
        cnpj: "12.345.678/0001-99",
        address: "Rua das Flores, 123",
        phone: "(11) 99999-9999",
        email: "contato@graciosaestudio.com.br",
        workingHours,
      })
      .where(eq(salons.userId, userId));
    console.log("Dados do salão atualizados com sucesso para o usuário admin.");
    process.exit(0);
  }

  // Criar um novo salão para o admin
  await db.insert(salons).values({
    id: nanoid(),
    userId: userId,
    name: "Graciosa Studio de Beleza",
    cnpj: "12.345.678/0001-99",
    address: "Rua das Flores, 123",
    phone: "(11) 99999-9999",
    email: "contato@graciosaestudio.com.br",
    workingHours,
  });

  console.log(
    "Salão 'Graciosa Studio de Beleza' criado com sucesso para o usuário admin!"
  );
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
