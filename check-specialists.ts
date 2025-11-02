// Script para verificar especialistas
import { getDb } from "./server/db";
import { specialists } from "./drizzle/schema";

async function checkSpecialists() {
  try {
    const db = await getDb();
    if (!db) {
      if (process.env.NODE_ENV !== "production") {
        console.log("❌ Não foi possível conectar ao banco");
      }
      return;
    }

    const specialistsList = await db.select().from(specialists);
    if (process.env.NODE_ENV !== "production") {
      console.log("👥 Especialistas encontrados:");
      specialistsList.forEach(spec => {
        console.log(`   ID: ${spec.id}, Nome: ${spec.name}`);
        console.log(`   Working Days:`, spec.workingDays);
      });
    }

    return specialistsList;
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

checkSpecialists();
