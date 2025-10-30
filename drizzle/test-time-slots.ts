/**
 * Script para testar a lógica híbrida de horários
 * Combina horários do salão + especialista
 */
import { config } from "dotenv";
import {
  getSpecialistsBySalonId,
  getServicesBySalonId,
  getAvailableTimeSlots,
  getSalonByUserId,
} from "../server/db.js";

config();

async function testTimeSlots() {
  try {
    console.log("🧪 TESTANDO LÓGICA HÍBRIDA DE HORÁRIOS");
    console.log("=====================================");

    // Data de teste - quinta-feira (30/10/2025)
    const testDate = new Date("2025-10-30T10:00:00.000Z");
    console.log(`📅 Data de teste: ${testDate.toLocaleDateString("pt-BR")}`);
    console.log(
      `📅 Dia da semana: ${testDate.toLocaleDateString("pt-BR", { weekday: "long" })}`
    );

    // Buscar o salão primeiro (assumindo que é o primeiro user - admin)
    const salon = await getSalonByUserId("8QAPBWWVZGnNm8ucbxF-s"); // ID do user admin
    if (!salon) {
      console.log("❌ Salão não encontrado");
      return;
    }

    console.log(`🏢 Salão: ${salon.name}`);
    console.log(
      `🕐 Horários do salão:`,
      JSON.stringify(salon.workingHours, null, 2)
    );

    // Buscar especialistas e serviços
    const specialists = await getSpecialistsBySalonId(salon.id);
    const services = await getServicesBySalonId(salon.id);

    if (specialists.length === 0) {
      console.log("❌ Nenhum especialista encontrado");
      return;
    }

    if (services.length === 0) {
      console.log("❌ Nenhum serviço encontrado");
      return;
    }

    console.log(`👥 Especialistas encontrados: ${specialists.length}`);
    console.log(`🛠️ Serviços encontrados: ${services.length}`);
    console.log("");

    // Testar para cada especialista (apenas o primeiro para não poluir)
    const specialist = specialists[0];
    const service = services[0];

    console.log(`🔍 TESTANDO: ${specialist.name} (${specialist.specialty})`);
    console.log("-------------------------------------------");
    console.log(
      `👤 Horários do especialista:`,
      JSON.stringify(specialist.workingDays, null, 2)
    );
    console.log(`\n🛠️ Serviço: ${service.name} (${service.duration}min)`);

    const availableSlots = await getAvailableTimeSlots(
      specialist.id,
      service.id,
      testDate
    );

    console.log(`\n✅ Horários disponíveis (${availableSlots.length}):`);
    availableSlots.forEach((slot, index) => {
      console.log(`   ${index + 1}. ${slot}`);
    });
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testTimeSlots();
