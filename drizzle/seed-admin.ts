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
    .where(eq(users.email, "adm@adm.com"));

  let userId: string;
  if (existingUser.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.log("👤 Usuário admin já existe, usando o existente...");
    }
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
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Usuário admin criado com sucesso!");
    }
  }

  // Verificar se o salão já existe para este usuário
  const existingSalon = await db
    .select()
    .from(salons)
    .where(eq(salons.userId, userId));

  if (existingSalon.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.log("🏢 Dados da empresa já existem!");
    }
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
      logo: null,
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Dados da empresa criados com sucesso!");
    }
  }

  // Criar usuário adicional solicitado manualmente (adm@adm.com) — senha: 277897
  const extraEmail = "adm@adm.com";
  const extraPassword = "277897";

  const existingExtra = await db
    .select()
    .from(users)
    .where(eq(users.email, extraEmail));
  if (existingExtra.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`👤 Usuário ${extraEmail} já existe, pulando criação...`);
    }
  } else {
    const extraHash = await bcrypt.hash(extraPassword, 10);
    const extraId = nanoid();
    await db.insert(users).values({
      id: extraId,
      email: extraEmail,
      password: extraHash,
      name: "Administrador",
      role: "admin",
    });
    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ Usuário ${extraEmail} criado com sucesso!`);
    }
  }

  // Criar usuário adicional teste@teste.com — senha: 123123
  const testeEmail = "teste@teste.com";
  const testePassword = "123123";

  const existingTeste = await db
    .select()
    .from(users)
    .where(eq(users.email, testeEmail));
  if (existingTeste.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`👤 Usuário ${testeEmail} já existe, pulando criação...`);
    }
  } else {
    const testeHash = await bcrypt.hash(testePassword, 10);
    const testeId = nanoid();
    await db.insert(users).values({
      id: testeId,
      email: testeEmail,
      password: testeHash,
      name: "Administrador",
      role: "admin",
    });
    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ Usuário ${testeEmail} criado com sucesso!`);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Horários de funcionamento configurados!");
    console.log("\n📧 Email: adm@admin.com");
    console.log("🔑 Senha: 123123");
    console.log("📧 Email extra: adm@adm.com");
    console.log("🔑 Senha extra: 277897");
    console.log("📧 Email teste: teste@teste.com");
    console.log("🔑 Senha teste: 123123");
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
