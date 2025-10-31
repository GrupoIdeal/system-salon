// Sincronização entre workingDays e specialist-schedule
// biome-ignore assist/source/organizeImports: false positive 
import { getSpecialistsBySalonId, getSpecialistById } from "./db";
import {
  getSpecialistSchedule,
  updateWorkingHoursForDay,
  getDayName,
} from "./specialist-schedule";

/**
 * Sincroniza os horários do workingDays (legacy) para o sistema specialist-schedule
 */
export async function syncLegacyWorkingDaysToSchedule(
  specialistId: string
): Promise<void> {
  try {
    const specialist = await getSpecialistById(specialistId);
    if (!specialist || !specialist.workingDays) {
      console.log(`❌ Specialist ${specialistId} not found or no workingDays`);
      return;
    }

    console.log(`🔄 Syncing workingDays for specialist ${specialist.name}`);

    // Mapeia os dias da semana do workingDays para o sistema de schedule
    const dayMapping: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    // Para cada dia na configuração legacy
    for (const [dayName, periods] of Object.entries(specialist.workingDays)) {
      const dayOfWeek = dayMapping[dayName];
      if (dayOfWeek === undefined) continue;

      if (periods && periods.length > 0) {
        // Pega o primeiro período (assumindo que há só um por dia na maioria dos casos)
        const mainPeriod = periods[0];

        await updateWorkingHoursForDay(specialistId, dayOfWeek, {
          isWorking: true,
          startTime: mainPeriod.start,
          endTime: mainPeriod.end,
          breakStartTime: mainPeriod.lunch?.start,
          breakEndTime: mainPeriod.lunch?.end,
        });

        console.log(
          `✅ Synced ${getDayName(dayOfWeek)}: ${mainPeriod.start}-${mainPeriod.end}`
        );
      } else {
        // Dia não trabalhado
        await updateWorkingHoursForDay(specialistId, dayOfWeek, {
          isWorking: false,
        });
        console.log(`✅ Set ${getDayName(dayOfWeek)} as non-working day`);
      }
    }

    console.log(`✅ Sync completed for specialist ${specialist.name}`);
  } catch (error) {
    console.error(`❌ Error syncing specialist ${specialistId}:`, error);
  }
}

/**
 * Sincroniza todos os especialistas de um salão
 */
export async function syncAllSpecialistsInSalon(
  salonId: string
): Promise<void> {
  try {
    const specialists = await getSpecialistsBySalonId(salonId);
    console.log(
      `🔄 Starting sync for ${specialists.length} specialists in salon ${salonId}`
    );

    for (const specialist of specialists) {
      await syncLegacyWorkingDaysToSchedule(specialist.id);
    }

    console.log(`✅ Sync completed for all specialists in salon ${salonId}`);
  } catch (error) {
    console.error(`❌ Error syncing salon ${salonId}:`, error);
  }
}

/**
 * Função helper para identificar se um especialista precisa de sincronização
 */
export async function needsSyncronization(
  specialistId: string
): Promise<boolean> {
  try {
    const specialist = await getSpecialistById(specialistId);
    const schedule = await getSpecialistSchedule(specialistId);

    // Se tem workingDays mas não tem horários configurados no schedule, precisa sincronizar
    const hasLegacyData = Boolean(
      specialist?.workingDays && Object.keys(specialist.workingDays).length > 0
    );
    const hasScheduleData = schedule.workingHours.some(wh => wh.isWorking);

    return hasLegacyData && !hasScheduleData;
  } catch {
    return false;
  }
}
