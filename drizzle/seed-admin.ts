/** biome-ignore-all assist/source/organizeImports: false positive */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../drizzle/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Environment variable DATABASE_URL is not set");
}
const client = postgres(databaseUrl);
const db = drizzle(client);

async function main() {
  const passwordHash = await bcrypt.hash("123123", 10);

  await db.insert(users).values({
    id: nanoid(),
    email: "adm@salao.com",
    password: passwordHash,
    name: "Administrador",
    role: "admin",
  });

  console.log("Usuário admin criado com sucesso!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
