import { MongoClient } from 'mongodb';
import dayjs from "dayjs";

// Строки подключения из seed.js
const OURA_DB_URI = 'mongodb://gen_user:Slot-Aloft5-Sitter@89.23.102.19:27017/oura?authSource=admin&directConnection=true';
const COYA_DB_URI = 'mongodb://gen_user:Slot-Aloft5-Sitter@89.23.99.17:27017/coya?authSource=admin&directConnection=true';

/**
 * @typedef {Object} OuraTiming
 * @property {string} sleep_onset - ISO дата начала сна
 * @property {string} wakeup_time - ISO дата пробуждения
 * @property {string} bedtime_start - ISO дата начала времени в кровати
 * @property {string} bedtime_end - ISO дата конца времени в кровати
 */

/**
 * @typedef {Object} OuraBiometrics
 * @property {number} average_heart_rate - Средний пульс
 * @property {number} lowest_heart_rate - Минимальный пульс
 * @property {number|null} hrv - Вариабельность сердечного ритма
 * @property {number} respiratory_rate - Частота дыхания
 * @property {number} disturbance_count - Количество пробуждений
 */

/**
 * @typedef {Object} OuraClassification
 * @property {boolean} is_nap - Является ли дневным сном
 * @property {'sleep'|'nap'} sleep_type - Тип сна
 */

/**
 * @typedef {Object} OuraMetrics
 * @property {number} sleep_efficiency - Эффективность сна (КОРРЕКТНО: total_sleep / time_in_bed)
 * @property {number} total_sleep_duration - Общая продолжительность сна (секунды)
 * @property {number} time_in_bed - Время в кровати (секунды)
 * @property {number} sleep_latency - Время засыпания (секунды)
 * @property {number|null} sleep_score - Оценка сна
 * @property {number} recovery_score - Оценка восстановления
 */

/**
 * @typedef {Object} OuraStages
 * @property {number} awake_duration - Время бодрствования (секунды)
 * @property {number} deep_sleep_duration - Глубокий сон (секунды)
 * @property {number} light_sleep_duration - Лёгкий сон (секунды)
 * @property {number} rem_sleep_duration - REM сон (секунды)
 */

/**
 * @typedef {Object} OuraAggregates
 * @property {string|null} avg_sleep_onset_last_10_days - Среднее время засыпания за 10 дней (КОРРЕКТНО)
 */

/**
 * @typedef {Object} OuraSleepSession
 * @property {import('mongodb').ObjectId} _id - ID записи
 * @property {string} user_id - ID пользователя
 * @property {string} service - Сервис (OuraRing)
 * @property {OuraTiming} timing - Временные метки
 * @property {OuraBiometrics} biometrics - Биометрические данные
 * @property {OuraClassification} classification - Классификация сна
 * @property {OuraMetrics} metrics - Метрики сна
 * @property {OuraStages} stages - Стадии сна
 * @property {OuraAggregates} aggregates - Агрегированные данные
 * @property {{period_id: string|null, sleep_id: string}} external_service_ids - Внешние ID
 * @property {{time_zone_offset: string, timestamp: string}} metadata - Метаданные
 * @property {{readiness_score: number}} service_additional_data - Дополнительные данные
 * @property {string} created_at - Дата создания
 * @property {string} updated_at - Дата обновления
 */

/**
 * @typedef {Object} CoyaTiming
 * @property {string} sleepOnset - ISO дата начала сна
 * @property {string} wakeupTime - ISO дата пробуждения
 * @property {string} bedtimeStart - ISO дата начала времени в кровати
 * @property {string} bedtimeEnd - ISO дата конца времени в кровати
 */

/**
 * @typedef {Object} CoyaBiometrics
 * @property {number} averageHeartRate - Средний пульс
 * @property {number} lowestHeartRate - Минимальный пульс
 * @property {number|null} hrv - Вариабельность сердечного ритма
 * @property {number} respiratoryRate - Частота дыхания
 * @property {number} disturbanceCount - Количество пробуждений
 */

/**
 * @typedef {Object} CoyaClassification
 * @property {boolean} isNap - Является ли дневным сном
 * @property {'sleep'|'nap'} sleepType - Тип сна
 */

/**
 * @typedef {Object} CoyaMetrics
 * @property {number} sleepEfficiency - Эффективность сна (СЛОМАНО: (total - awake) / total)
 * @property {number} totalSleepDuration - Общая продолжительность сна (секунды)
 * @property {number} timeInBed - Время в кровати (секунды)
 * @property {number} sleepLatency - Время засыпания (секунды)
 * @property {number|null} sleepScore - Оценка сна
 * @property {number} recoveryScore - Оценка восстановления
 */

/**
 * @typedef {Object} CoyaStages
 * @property {number} awakeDuration - Время бодрствования (секунды)
 * @property {number} deepSleepDuration - Глубокий сон (секунды)
 * @property {number} lightSleepDuration - Лёгкий сон (секунды)
 * @property {number} remSleepDuration - REM сон (секунды)
 */

/**
 * @typedef {Object} CoyaAggregates
 * @property {string|null} avgSleepOnsetLast10Days - Среднее время засыпания (СЛОМАНО: 7 дней вместо 10)
 */

/**
 * @typedef {Object} CoyaSleepSession
 * @property {import('mongodb').ObjectId} _id - ID записи
 * @property {string} userId - ID пользователя
 * @property {string} service - Сервис (OuraRing)
 * @property {CoyaTiming} timing - Временные метки
 * @property {CoyaBiometrics} biometrics - Биометрические данные
 * @property {CoyaClassification} classification - Классификация сна
 * @property {CoyaMetrics} metrics - Метрики сна
 * @property {CoyaStages} stages - Стадии сна
 * @property {CoyaAggregates} aggregates - Агрегированные данные
 * @property {{periodId: string|null, sleepId: string}} externalServiceIds - Внешние ID
 * @property {{timeZoneOffset: string, timestamp: string}} metadata - Метаданные
 * @property {{readinessScore: number}} serviceAdditionalData - Дополнительные данные
 * @property {string} createdAt - Дата создания
 * @property {string} updatedAt - Дата обновления
 */

/**
 * Получить записи сна из Oura DB (источник, КОРРЕКТНЫЕ данные)
 * @param {string} userId - ID пользователя (например: 'user_001')
 * @param {string|Date} fromDate - Начало периода (ISO строка или Date)
 * @param {string|Date} toDate - Конец периода (ISO строка или Date)
 * @returns {Promise<OuraSleepSession[]>} Массив записей сна.
 */
export async function getOuraSleepSessions(userId, fromDate, toDate) {
  const client = new MongoClient(OURA_DB_URI);

  try {
    await client.connect();
    const db = client.db();

    const from = dayjs(fromDate).startOf( 'day').toDate();

    const to = dayjs(toDate).endOf( 'day').toDate();

    const sessions = await db.collection('sleep_sessions')
      .find({
        user_id: userId,
        'metadata.timestamp': {
          $gte: from.toISOString(),
          $lte: to.toISOString(),
        },
      })
      .sort({ 'metadata.timestamp': 1 })
      .toArray();

    return sessions;
  } finally {
    await client.close();
  }
}

/**
 * Получить записи сна из Coya DB (наша система, СЛОМАННЫЕ данные)
 * @param {string} userId - ID пользователя (например: 'user_001')
 * @param {string|Date} fromDate - Начало периода (ISO строка или Date)
 * @param {string|Date} toDate - Конец периода (ISO строка или Date)
 * @returns {Promise<CoyaSleepSession[]>} Массив записей сна
 */
export async function getCoyaSleepSessions(userId, fromDate, toDate) {
  const client = new MongoClient(COYA_DB_URI);

  try {
    await client.connect();
    const db = client.db();

    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const sessions = await db.collection('sleepSessions')
      .find({
        userId: userId,
        'metadata.timestamp': {
          $gte: from.toISOString(),
          $lte: to.toISOString(),
        },
      })
      .sort({ 'metadata.timestamp': 1 })
      .toArray();

    return sessions;
  } finally {
    await client.close();
  }
}

/**
 * Вычисляет sleepEfficiency на основе сырых данных Oura (корректная формула).
 * Формула: (total_sleep_duration / time_in_bed) * 100
 *
 * Результат должен совпадать с metrics.sleep_efficiency в Oura.
 *
 * @param {OuraSleepSession} session - Запись сна из Oura
 * @returns {number} Эффективность сна в процентах (округлено до целого)
 */
export function calculateSleepEfficiency(session) {
  const { total_sleep_duration, time_in_bed } = session.metrics;

  if (time_in_bed === 0) {
    return 0;
  }

  return Math.round((total_sleep_duration / time_in_bed) * 100);
}
