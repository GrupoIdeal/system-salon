import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Carrega variáveis de ambiente de .env em ambiente de desenvolvimento
dotenv.config();

function parseDatabaseUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const port = u.port ? Number(u.port) : undefined;
    const user = decodeURIComponent(u.username || "");
    const password = decodeURIComponent(u.password || "");
    const database = u.pathname ? u.pathname.replace(/^\//, "") : "";
    const sslmode = u.searchParams.get("sslmode");
    const ssl = sslmode === "disable" ? false : true;
    return { host, port, user, password, database, ssl };
  } catch {
    return undefined;
  }
}

const fromUrl = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : undefined;

const dbCredentials = fromUrl || {
  host: process.env.DB_HOST || process.env.PGHOST || "localhost",
  port: process.env.DB_PORT
    ? Number(process.env.DB_PORT)
    : process.env.PGPORT
      ? Number(process.env.PGPORT)
      : 5432,
  user: process.env.DB_USER || process.env.PGUSER || "",
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || "",
  database: process.env.DB_NAME || process.env.PGDATABASE || "",
  ssl: (() => {
    if (typeof process.env.DB_SSL !== "undefined")
      return !(process.env.DB_SSL === "false");
    if (typeof process.env.PGSSLMODE !== "undefined")
      return !(process.env.PGSSLMODE === "disable");
    return false;
  })(),
};

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials,
});
