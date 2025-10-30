import { config } from "dotenv";
config();
import postgres from "postgres";

async function checkDB() {
  try {
    const client = postgres(process.env.DATABASE_URL);

    console.log("🔍 Verificando banco de dados...");

    const users = await client`SELECT id, name, role FROM users LIMIT 5`;
    console.log("👤 Users:", users);

    const salons = await client`SELECT id, name, "userId" FROM salons LIMIT 5`;
    console.log("🏢 Salons:", salons);

    const specialists =
      await client`SELECT id, name, "salonId" FROM specialists LIMIT 5`;
    console.log("👥 Specialists:", specialists);

    await client.end();
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
  process.exit(0);
}

checkDB();
