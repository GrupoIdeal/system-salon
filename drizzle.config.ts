import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "easypanel.ronnysenna.com.br",
    port: 5434,
    user: "salon",
    password: "Ideal2015net",
    database: "salon",
    ssl: false,
  },
});
